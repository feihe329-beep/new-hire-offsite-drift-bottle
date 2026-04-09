import { useState } from 'react'
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { motion } from 'framer-motion'
import { formatEther } from 'viem'
import { CapsuleCard, CapsuleData } from '../components/CapsuleCard'
import { DRIFT_BOTTLE_ADDRESS, DRIFT_BOTTLE_ABI, CHAIN } from '../contracts/DriftBottle'

const OPEN_PRICE = 1000000000000000n // 0.001 ETH

interface CapsuleWithMessage extends CapsuleData {
  message?: string
}

export function ThePond() {
  const [openingId, setOpeningId] = useState<bigint | null>(null)
  const [revealedMessages, setRevealedMessages] = useState<Record<string, string>>({})

  const { data: totalCapsules } = useReadContract({
    address: DRIFT_BOTTLE_ADDRESS,
    abi: DRIFT_BOTTLE_ABI,
    functionName: 'totalCapsules',
  })

  const { data: openPrice } = useReadContract({
    address: DRIFT_BOTTLE_ADDRESS,
    abi: DRIFT_BOTTLE_ABI,
    functionName: 'OPEN_PRICE',
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

  const { data: results, isLoading } = useReadContracts({
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
      const state = stateRes.result as number
      // Only show expired (2) capsules
      if (state !== 2) continue
      const [sender, recipient, unlockTime, expiryTime, ethAmount, opened] = capsuleRes.result as [string, string, bigint, bigint, bigint, boolean]
      const id = BigInt(i)
      capsules.push({
        id,
        sender,
        recipient,
        unlockTime,
        expiryTime,
        ethAmount,
        opened,
        state,
        message: revealedMessages[id.toString()],
      })
    }
  }

  // Sort by ETH amount descending
  capsules.sort((a, b) => Number(b.ethAmount - a.ethAmount))

  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: CHAIN.id,
  })

  const handleOpenExpired = (capsule: CapsuleWithMessage) => {
    setOpeningId(capsule.id)
    writeContract(
      {
        chain: CHAIN,
        address: DRIFT_BOTTLE_ADDRESS,
        abi: DRIFT_BOTTLE_ABI,
        functionName: 'openExpired',
        args: [capsule.id],
        value: openPrice ?? OPEN_PRICE,
      },
      {
        onSuccess: () => {
          setRevealedMessages((prev) => ({ ...prev, [capsule.id.toString()]: '(refresh to see message)' }))
        },
      }
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">The Pond</h1>
          <p className="text-gray-400">
            Unclaimed bottles drift into the ocean. Open one and see what secrets it holds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 border border-white/10 mb-8"
        >
          <p className="text-sm text-gray-300">
            <span className="text-sky-400 font-semibold">💡 Tip:</span> Open a bottle for{' '}
            <span className="text-green-400 font-semibold">
              {openPrice ? formatEther(openPrice) : '0.001'} ETH
            </span>{' '}
            and discover unknown messages. Most valuable bottles are listed first.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-12 border border-white/10 text-center"
          >
            <span className="text-6xl block mb-4">🌊</span>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">The Pond is Calm...</h3>
            <p className="text-gray-500">
              No expired bottles yet. Come back soon to discover hidden messages!
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((capsule, idx) => (
              <motion.div
                key={capsule.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <CapsuleCard
                  capsule={capsule}
                  action={
                    !capsule.opened
                      ? {
                          label: `Open for ${openPrice ? formatEther(openPrice) : '0.001'} ETH`,
                          onClick: () => handleOpenExpired(capsule),
                          loading: openingId === capsule.id && (isWritePending || isConfirming),
                        }
                      : undefined
                  }
                  showMessage={!!capsule.message}
                  message={capsule.message}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
