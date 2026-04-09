import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { config } from './wagmi';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { WriteCapsule } from './pages/WriteCapsule';
import { MyBottles } from './pages/MyBottles';
import { ToMe } from './pages/ToMe';
import { ThePond } from './pages/ThePond';
const queryClient = new QueryClient();
function App() {
    return (_jsx(WagmiProvider, { config: config, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsxs("div", { className: "min-h-screen bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-950", children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/write", element: _jsx(WriteCapsule, {}) }), _jsx(Route, { path: "/my-bottles", element: _jsx(MyBottles, {}) }), _jsx(Route, { path: "/to-me", element: _jsx(ToMe, {}) }), _jsx(Route, { path: "/pond", element: _jsx(ThePond, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }) }) }) }));
}
export default App;
//# sourceMappingURL=App.js.map