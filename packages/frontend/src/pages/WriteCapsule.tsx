import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { motion } from 'framer-motion'
import { DRIFT_BOTTLE_ADDRESS, DRIFT_BOTTLE_ABI } from '../contracts/DriftBottle'

const LOCK_DURATIONS = [
  { label: '1 second (demo)', value: '1' },
  { label: '1 minute (demo)', value: '60' },
  { label: '1 month', value: String(30 * 24 * 60 * 60) },
  { label: '6 months', value: String(6 * 30 * 24 * 60 * 60) },
  { label: '1 year', value: String(365 * 24 * 60 * 60) },
  { label: '2 years', value: String(2 * 365 * 24 * 60 * 60) },
  { label: '5 years', value: String(5 * 365 * 24 * 60 * 60) },
]

export function WriteCapsule() {
  const { address, isConnected } = useAccount()
  const [message, setMessage] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [lockDuration, setLockDuration] = useState(LOCK_DURATIONS[2].value)
  const [capsuleId, setCapsuleId] = useState<string | null>(null)

  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (isSuccess && txHash) {
      setCapsuleId(txHash)
    }
  }, [isSuccess, txHash])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (!message.trim() || !recipient.trim()) {
      alert('Please fill in message and recipient address')
      return
    }

    // Encode message as "demo:" + base64
    const encodedMessage = 'demo:' + btoa(message)

    // Convert amount to wei (0 if empty)
    const ethAmount = amount ? parseEther(amount) : 0n

    writeContract({
      address: DRIFT_BOTTLE_ADDRESS,
      abi: DRIFT_BOTTLE_ABI,
      functionName: 'createCapsule',
      args: [recipient as `0x${string}`, encodedMessage, encodedMessage, BigInt(lockDuration)],
      value: ethAmount,
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-xl p-12 border border-white/10 text-center max-w-md">
          <span className="text-6xl block mb-4">🫙</span>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to create a message bottle.
          </p>
          <p className="text-sm text-gray-500">Use the "Connect Wallet" button in the navbar.</p>
        </div>
      </div>
    )
  }

  if (isSuccess && capsuleId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center px-4 py-12"
      >
        <div className="glass rounded-xl p-12 border border-white/10 text-center max-w-md">
          <motion.span
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl block mb-6"
          >
            ✨
          </motion.span>
          <h2 className="text-3xl font-bold text-sky-400 mb-4">Bottle Sealed!</h2>
          <p className="text-gray-300 mb-6">
            Your message has been locked and sent into the digital ocean.
          </p>
          <div className="bg-black/30 rounded-lg p-4 mb-6 border border-sky-400/30">
            <p className="text-xs text-gray-500 mb-1">Capsule ID</p>
            <p className="text-lg font-mono text-sky-400">{capsuleId}</p>
          </div>
          <button
            onClick={() => {
              setCapsuleId(null)
              setMessage('')
            }}
            className="px-6 py-2 bg-gradient-to-r from-sky-400 to-indigo-400 text-white rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition font-medium"
          >
            Write Another
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Seal a Bottle</h1>
          <p className="text-gray-400">Write a message to someone special, locked in time.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your heart out..."
              className="w-full h-40 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-sky-400/50 focus:outline-none resize-none"
            />
          </motion.div>

          {/* Recipient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-sky-400/50 focus:outline-none font-mono text-sm"
            />
          </motion.div>

          {/* Amount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-200 mb-2">
              ETH Amount (optional)
            </label>
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-sky-400/50 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for 0 ETH</p>
          </motion.div>

          {/* Lock Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Lock Duration
            </label>
            <select
              value={lockDuration}
              onChange={(e) => setLockDuration(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-sky-400/50 focus:outline-none"
            >
              {LOCK_DURATIONS.map((d) => (
                <option key={d.value} value={d.value} className="bg-ocean-900">
                  {d.label}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            type="submit"
            disabled={isWritePending || isConfirming}
            className="w-full py-4 bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isWritePending || isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isWritePending ? 'Preparing...' : 'Confirming...'}
              </span>
            ) : (
              'Seal the Bottle 🫙'
            )}
          </motion.button>
        </form>
      </div>
    </div>
  )
}
