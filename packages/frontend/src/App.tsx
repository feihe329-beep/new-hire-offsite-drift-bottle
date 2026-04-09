import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { config } from './wagmi'
import { Navbar } from './components/Navbar'
import { Landing } from './pages/Landing'
import { WriteCapsule } from './pages/WriteCapsule'
import { MyBottles } from './pages/MyBottles'
import { ToMe } from './pages/ToMe'
import { ThePond } from './pages/ThePond'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-950">
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/write" element={<WriteCapsule />} />
              <Route path="/my-bottles" element={<MyBottles />} />
              <Route path="/to-me" element={<ToMe />} />
              <Route path="/pond" element={<ThePond />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
