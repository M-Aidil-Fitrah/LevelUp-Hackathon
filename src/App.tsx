import './App.css'
import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
// Lazy-load all non-landing routes to reduce initial bundle
const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const ChatbotAI = React.lazy(() => import('./pages/ChatbotAI'))
const ChatBubble = React.lazy(() => import('./components/chatbot/ChatBubble'))
const Marketplace = React.lazy(() => import('./pages/Marketplace'))
const MarketplaceProduct = React.lazy(() => import('./pages/MarketplaceProduct'))
const UpgradeToSeller = React.lazy(() => import('./pages/UpgradeToSeller'))
const UmkmNearby = React.lazy(() => import('./pages/UmkmNearby'))
const SellerDashboard = React.lazy(() => import('./pages/seller/SellerDashboard'))
const AddProductPage = React.lazy(() => import('./pages/seller/AddProduct'))
const EditProductPage = React.lazy(() => import('./pages/seller/EditProduct'))
const DeleteProductPage = React.lazy(() => import('./pages/seller/DeleteProduct'))
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'))
const VerifySellerPage = React.lazy(() => import('./pages/admin/VerifySeller'))
const VerifySellerDetailPage = React.lazy(() => import('./pages/admin/VerifySellerDetail'))

function AppShell() {
	const location = useLocation();
	const path = location.pathname;
	const hideChat =
		path.startsWith('/login') ||
		path.startsWith('/register') ||
		path.startsWith('/chatbot') ||
		path.startsWith('/umkm-nearby') ||
		path.startsWith('/admin') ||
		path.startsWith('/seller');
	return (
		<>
			<Suspense fallback={<div />}> 
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/chatbot" element={<ChatbotAI />} />
				<Route path="/marketplace" element={<Marketplace />} />
				<Route path="/marketplace/:id" element={<MarketplaceProduct />} />
				<Route path="/umkm-nearby" element={<UmkmNearby />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/upgrade-to-seller" element={<UpgradeToSeller />} />
				<Route path="/seller/dashboard" element={<SellerDashboard />} />
				<Route path="/seller/add" element={<AddProductPage />} />
				<Route path="/seller/edit" element={<EditProductPage />} />
				<Route path="/seller/delete" element={<DeleteProductPage />} />
				<Route path="/admin/dashboard" element={<AdminDashboard />} />
				<Route path="/admin/verify-seller" element={<VerifySellerPage />} />
				<Route path="/admin/verify-seller/:id" element={<VerifySellerDetailPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />

			</Routes>
			</Suspense>
			{!hideChat && (
			  <Suspense fallback={null}>
			    <ChatBubble />
			  </Suspense>
			)}
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
