import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CapsuleCard, CapsuleData } from '../components/CapsuleCard'
import { DRIFT_BOTTLE_ADDRESS, DRIFT_BOTTLE_ABI, CHAIN } from '../contracts/DriftBottle'

interface CapsuleWithMessage extends CapsuleData {
  message?: string
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

  const { data: totalCapsules } = useReadContract({
    address: DRIFT_BOTTLE_ADDRESS,
    abi: DRIFT_BOTTLE_ABI,
    functionName: 'totalCapsules',
  })

  const total = Number(totalCapsules ?? 0n)

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
      if (recipient.toLowerCase() !== address?.toLowerCase()) continue
      const id = BigInt(i)

      capsules.push({
        id,
        sender,
        recipient,
        unlockTime,
        expiryTime,
        ethAmount,
        opened,
        state: stateRes.result as number,
        message: decodedMessages[id.toString()],
      })
    }
  }

  // Fetch CIDs individually (not via multicall) so msg.sender is the user's address
  useEffect(() => {
    if (!publicClient || !address || capsules.length === 0) return

    const openedIds = capsules
      .filter((c) => c.state === 3 || c.state === 1)
      .map((c) => c.id)

    if (openedIds.length === 0) return

    let cancelled = false
    ;(async () => {
      const msgs: Record<string, string> = {}
      for (const id of openedIds) {
        try {
          const cid = await publicClient.readContract({
            address: DRIFT_BOTTLE_ADDRESS,
            abi: DRIFT_BOTTLE_ABI,
            functionName: 'getRecipientCID',
            args: [id],
            account: address,
          })
          msgs[id.toString()] = decodeMessage(cid)
        } catch {
          // Reverts for locked capsules or non-recipients — expected
        }
      }
      if (!cancelled) setDecodedMessages(msgs)
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, address, dataUpdatedAt])

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
          <p className="text-gray-400">Bottles sent to your address.</p>
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
