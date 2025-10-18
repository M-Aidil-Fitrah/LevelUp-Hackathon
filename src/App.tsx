import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import ChatbotAI from './pages/ChatbotAI'
import ChatBubble from './components/chatbot/ChatBubble'
import Marketplace from './pages/Marketplace'
import MarketplaceProduct from './pages/MarketplaceProduct'
import ProductDetail from './pages/ProductDetail'
import UpgradeToSeller from './pages/UpgradeToSeller'
import AdminDashboard from './pages/admin/AdminDashboard'
import LoginAdmin from './pages/admin/LoginAdmin'

function AppShell() {
	const location = useLocation();
	const hideChat = location.pathname.startsWith('/login') || location.pathname.startsWith('/register') || location.pathname.startsWith('/chatbot');
	return (
		<>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/chatbot" element={<ChatbotAI />} />
				<Route path="/marketplace" element={<Marketplace />} />
				<Route path="/marketplace-product" element={<MarketplaceProduct />} />
				<Route path="/product-detail" element={<ProductDetail />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/upgrade-to-seller" element={<UpgradeToSeller />} />
				<Route path="*" element={<Navigate to="/" replace />} />

				{/* Admin routes */}
				 <Route path="/admin/login" element={<LoginAdmin />} />
        		<Route path="/admin/dashboard" element={<AdminDashboard />} />
			</Routes>
			{!hideChat && <ChatBubble />}
		</>
	)
}

function App() {
	return (
		<BrowserRouter>
			<AppShell />
		</BrowserRouter>
	)
}

export default App
