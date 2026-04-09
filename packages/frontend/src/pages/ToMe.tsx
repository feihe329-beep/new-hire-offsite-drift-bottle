import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { parseAbiItem } from 'viem'
import { motion } from 'framer-motion'
import { CapsuleCard, CapsuleData } from '../components/CapsuleCard'
import { DRIFT_BOTTLE_ADDRESS, DRIFT_BOTTLE_ABI, CHAIN, DRIFT_BOTTLE_DEPLOY_BLOCK } from '../contracts/DriftBottle'

interface CapsuleWithMessage extends CapsuleData {
  message?: string
  openedByMe?: boolean
}

function decodeMessage(cid: string): string {
  if (cid.startsWith('demo:')) {
    try {
      return atob(cid.slice(5))
    } catch {
      return cid
    }
  }
  return cid
}

export function ToMe() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()
  const [decodedMessages, setDecodedMessages] = useState<Record<string, string>>({})
  const [openedByMeIds, setOpenedByMeIds] = useState<Set<string>>(new Set())
  const [eventsLoaded, setEventsLoaded] = useState(false)

  const { data: totalCapsules } = useReadContract({
    address: DRIFT_BOTTLE_ADDRESS,
    abi: DRIFT_BOTTLE_ABI,
    functionName: 'totalCapsules',
  })

  const total = Number(totalCapsules ?? 0n)

  // Fetch events to find capsules opened by this user
  useEffect(() => {
    if (!publicClient || !address) return

    let cancelled = false
    ;(async () => {
      const ids = new Set<string>()
      try {
        const [recipientLogs, expiredLogs] = await Promise.all([
          publicClient.getLogs({
            address: DRIFT_BOTTLE_ADDRESS,
            event: parseAbiItem('event CapsuleOpened(uint256 indexed capsuleId, address opener)'),
            fromBlock: DRIFT_BOTTLE_DEPLOY_BLOCK,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: DRIFT_BOTTLE_ADDRESS,
            event: parseAbiItem('event ExpiredCapsuleOpened(uint256 indexed capsuleId, address opener)'),
            fromBlock: DRIFT_BOTTLE_DEPLOY_BLOCK,
            toBlock: 'latest',
          }),
        ])
        for (const log of [...recipientLogs, ...expiredLogs]) {
          if (log.args.opener?.toLowerCase() === address.toLowerCase()) {
            ids.add(log.args.capsuleId!.toString())
          }
        }
        if (!cancelled) {
          setOpenedByMeIds(ids)
          setEventsLoaded(true)
        }
      } catch {
        // Event fetching failed — leave eventsLoaded false so the
        // "hide if opened by someone else" filter is skipped safely.
      }
    })()

    return () => { cancelled = true }
  }, [publicClient, address])

  const capsuleContracts = Array.from({ length: total }, (_, i) => [
    {
      address: DRIFT_BOTTLE_ADDRESS,
      abi: DRIFT_BOTTLE_ABI,
      functionName: 'getCapsule',
      args: [BigInt(i)],
    },
    {
      address: DRIFT_BOTTLE_ADDRESS,
      abi: DRIFT_BOTTLE_ABI,
      functionName: 'getState',
      args: [BigInt(i)],
    },
  ]).flat()

  const { data: results, isLoading, dataUpdatedAt } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: capsuleContracts as any[],
    query: { enabled: total > 0 },
  })

  const capsules: CapsuleWithMessage[] = []
  if (results) {
    for (let i = 0; i < total; i++) {
      const capsuleRes = results[i * 2]
      const stateRes = results[i * 2 + 1]
      if (capsuleRes.status !== 'success' || stateRes.status !== 'success') continue
      const [sender, recipient, unlockTime, expiryTime, ethAmount, opened] = capsuleRes.result as [string, string, bigint, bigint, bigint, boolean]
      const id = BigInt(i)
      const idStr = id.toString()

      const isRecipient = recipient.toLowerCase() === address?.toLowerCase()
      const wasOpenedByMe = openedByMeIds.has(idStr)
      const state = stateRes.result as number

      // Hide capsules addressed to me but opened by someone else
      if (eventsLoaded && isRecipient && state === 3 && !wasOpenedByMe) continue

      if (!isRecipient && !wasOpenedByMe) continue

      capsules.push({
        id,
        sender,
        recipient,
        unlockTime,
        expiryTime,
        ethAmount,
        opened,
        state: stateRes.result as number,
        message: decodedMessages[idStr],
        openedByMe: wasOpenedByMe,
      })
    }
  }

  // Fetch CIDs individually (not via multicall) so msg.sender is correct
  useEffect(() => {
    if (!publicClient || !address || capsules.length === 0) return

    const toFetch = capsules.filter(
      (c) => c.state === 3 || c.state === 1
    )
    if (toFetch.length === 0) return

    let cancelled = false
    ;(async () => {
      const msgs: Record<string, string> = {}
      for (const capsule of toFetch) {
        const isRecipient = capsule.recipient.toLowerCase() === address.toLowerCase()

        // Try recipientCID first (works if user is recipient and capsule is unlocked)
        if (isRecipient) {
          try {
            const cid = await publicClient.readContract({
              address: DRIFT_BOTTLE_ADDRESS,
              abi: DRIFT_BOTTLE_ABI,
              functionName: 'getRecipientCID',
              args: [capsule.id],
              account: address,
            })
            msgs[capsule.id.toString()] = decodeMessage(cid)
            continue
          } catch {
            // Fall through to publicCID
          }
        }

        // Try publicCID (works for opened expired capsules)
        try {
          const cid = await publicClient.readContract({
            address: DRIFT_BOTTLE_ADDRESS,
            abi: DRIFT_BOTTLE_ABI,
            functionName: 'getPublicCID',
            args: [capsule.id],
          })
          msgs[capsule.id.toString()] = decodeMessage(cid)
        } catch {
          // Not available yet
        }
      }
      if (!cancelled) setDecodedMessages(msgs)
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, address, dataUpdatedAt, openedByMeIds])

  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: CHAIN.id,
  })

  useEffect(() => {
    if (isSuccess) queryClient.invalidateQueries()
  }, [isSuccess, queryClient])

  const handleOpenBottle = (capsule: CapsuleWithMessage) => {
    writeContract({
      chain: CHAIN,
      address: DRIFT_BOTTLE_ADDRESS,
      abi: DRIFT_BOTTLE_ABI,
      functionName: 'open',
      args: [capsule.id],
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-xl p-12 border border-white/10 text-center max-w-md">
          <span className="text-6xl block mb-4">💌</span>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect to view bottles that have been sent to you.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">To Me</h1>
          <p className="text-gray-400">Bottles sent to you and bottles you've opened.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : capsules.length === 0 ? (
          <div className="glass rounded-xl p-12 border border-white/10 text-center">
            <span className="text-5xl block mb-4">💌</span>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Messages For You Yet</h3>
            <p className="text-gray-500">
              When someone sends you a bottle, it will appear here. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {capsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id.toString()}
                capsule={capsule}
                action={
                  capsule.state === 1 && !capsule.opened
                    ? {
                        label: 'Open Bottle 🔓',
                        onClick: () => handleOpenBottle(capsule),
                        loading: isWritePending || isConfirming,
                      }
                    : undefined
                }
                showMessage={!!capsule.message}
                message={capsule.message}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
