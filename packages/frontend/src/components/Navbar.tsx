import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { DriftBottleIcon } from './DriftBottleIcon'

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gradient hover:opacity-80 transition"
          >
            <DriftBottleIcon size={28} tilt />
            <span>DriftBottle</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/write"
              className="text-sm text-gray-300 hover:text-sky-400 transition"
            >
              Write
            </Link>
            <Link
              to="/my-bottles"
              className="text-sm text-gray-300 hover:text-sky-400 transition"
            >
              My Bottles
            </Link>
            <Link
              to="/to-me"
              className="text-sm text-gray-300 hover:text-sky-400 transition"
            >
              To Me
            </Link>
            <Link
              to="/pond"
              className="text-sm text-gray-300 hover:text-sky-400 transition"
            >
              The Pond
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-400 px-3 py-2 glass rounded-lg">
                  {truncateAddress(address)}
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition text-sm font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const injectedConnector = connectors.find((c) => c.id === 'injected')
                  if (injectedConnector) {
                    connect({ connector: injectedConnector })
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-sky-400 to-indigo-400 text-white rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition font-medium text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-4 pb-4 flex-wrap">
          <Link to="/write" className="text-xs text-gray-300 hover:text-sky-400">
            Write
          </Link>
          <Link to="/my-bottles" className="text-xs text-gray-300 hover:text-sky-400">
            My Bottles
          </Link>
          <Link to="/to-me" className="text-xs text-gray-300 hover:text-sky-400">
            To Me
          </Link>
          <Link to="/pond" className="text-xs text-gray-300 hover:text-sky-400">
            Pond
          </Link>
        </div>
      </div>
    </nav>
  )
}
