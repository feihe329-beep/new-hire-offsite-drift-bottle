import { formatEther } from 'viem'
import { motion } from 'framer-motion'

export interface CapsuleData {
  id: bigint
  sender: string
  recipient: string
  unlockTime: bigint
  expiryTime: bigint
  ethAmount: bigint
  opened: boolean
  state: number // 0 = locked, 1 = valid, 2 = expired
}

interface CapsuleCardProps {
  capsule: CapsuleData
  action?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
  showMessage?: boolean
  message?: string
}

export function CapsuleCard({ capsule, action, showMessage, message }: CapsuleCardProps) {
  const getStateLabel = (state: number) => {
    switch (state) {
      case 0:
        return { label: '🔒 Locked', color: 'text-yellow-400' }
      case 1:
        return { label: '✅ Valid', color: 'text-green-400' }
      case 2:
        return { label: '⏰ Expired', color: 'text-red-400' }
      default:
        return { label: '❓ Unknown', color: 'text-gray-400' }
    }
  }

  const state = getStateLabel(capsule.state)
  const ethAmount = formatEther(capsule.ethAmount)

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-xl p-6 border border-white/10 hover:border-sky-400/30 transition"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-1">From</p>
            <p className="text-sm font-mono text-gray-300">{truncateAddress(capsule.sender)}</p>
          </div>
          <div className={`text-sm font-semibold ${state.color}`}>{state.label}</div>
        </div>

        {/* Recipient */}
        <div>
          <p className="text-xs text-gray-500 mb-1">To</p>
          <p className="text-sm font-mono text-gray-300">{truncateAddress(capsule.recipient)}</p>
        </div>

        {/* ETH Amount */}
        {parseFloat(ethAmount) > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">ETH Amount</p>
            <p className="text-sm font-semibold text-sky-400">{ethAmount} ETH</p>
          </div>
        )}

        {/* Message Content */}
        {showMessage && message && (
          <div className="bg-black/20 rounded-lg p-4 border border-sky-400/20 max-h-40 overflow-y-auto">
            <p className="text-xs text-gray-500 mb-2">Message</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{message}</p>
          </div>
        )}

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            disabled={action.loading}
            className="w-full mt-4 py-2 bg-gradient-to-r from-sky-400 to-indigo-400 text-white rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {action.loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              action.label
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}
