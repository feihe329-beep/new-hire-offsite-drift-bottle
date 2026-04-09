import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { motion } from 'framer-motion'
import { CapsuleCard, CapsuleData } from '../components/CapsuleCard'
import { DRIFT_BOTTLE_ADDRESS, DRIFT_BOTTLE_ABI } from '../contracts/DriftBottle'

export function MyBottles() {
  const { address, isConnected } = useAccount()

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

  const { data: results, isLoading } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: capsuleContracts as any[],
    query: { enabled: total > 0 },
  })

  const capsules: CapsuleData[] = []
  if (results) {
    for (let i = 0; i < total; i++) {
      const capsuleRes = results[i * 2]
      const stateRes = results[i * 2 + 1]
      if (capsuleRes.status !== 'success' || stateRes.status !== 'success') continue
      const [sender, recipient, unlockTime, expiryTime, ethAmount, opened] = capsuleRes.result as [string, string, bigint, bigint, bigint, boolean]
      if (sender.toLowerCase() !== address?.toLowerCase()) continue
      capsules.push({
        id: BigInt(i),
        sender,
        recipient,
        unlockTime,
        expiryTime,
        ethAmount,
        opened,
        state: stateRes.result as number,
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-xl p-12 border border-white/10 text-center max-w-md">
          <span className="text-6xl block mb-4">🫙</span>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect to view the bottles you've created and sent into the ocean.
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
          <h1 className="text-4xl font-bold text-gradient mb-2">My Bottles</h1>
          <p className="text-gray-400">Bottles you've sealed and sent into the ocean.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : capsules.length === 0 ? (
          <div className="glass rounded-xl p-12 border border-white/10 text-center">
            <span className="text-5xl block mb-4">🌊</span>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Bottles Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't created any message bottles yet. Start by writing your first message!
            </p>
            <a
              href="/write"
              className="inline-block px-6 py-2 bg-gradient-to-r from-sky-400 to-indigo-400 text-white rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition font-medium"
            >
              Write a Message
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {capsules.map((capsule) => (
              <CapsuleCard key={capsule.id.toString()} capsule={capsule} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
