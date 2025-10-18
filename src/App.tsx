import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import LandingPage from './pages/LandingPage'
import ChatbotAI from './pages/ChatbotAI'
import ChatBubble from './components/chatbot/ChatBubble'
import Marketplace from './pages/Marketplace'
import MarketplaceProduct from './pages/MarketplaceProduct'
import ProductDetail from './pages/ProductDetail'
import UpgradeToSeller from './pages/UpgradeToSeller'
import SellerDashboard from './pages/seller/SellerDashboard'
import AddProductPage from './pages/seller/AddProduct'
import EditProductPage from './pages/seller/EditProduct'
import DeleteProductPage from './pages/seller/DeleteProduct'
import AdminDashboard from './pages/admin/AdminDashboard'
import VerifySellerPage from './pages/admin/VerifySeller'

function AppShell() {
	const location = useLocation();
	const path = location.pathname;
	const hideChat =
		path.startsWith('/login') ||
		path.startsWith('/register') ||
		path.startsWith('/chatbot') ||
		path.startsWith('/admin') ||
		path.startsWith('/seller');
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
				<Route path="/seller/dashboard" element={<SellerDashboard />} />
				<Route path="/seller/add" element={<AddProductPage />} />
				<Route path="/seller/edit" element={<EditProductPage />} />
				<Route path="/seller/delete" element={<DeleteProductPage />} />
				<Route path="/admin/dashboard" element={<AdminDashboard />} />
				<Route path="/admin/verify-seller" element={<VerifySellerPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />

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
