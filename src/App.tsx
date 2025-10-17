import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import ChatbotAI from './pages/ChatbotAI'
import ChatBubble from './components/chatbot/ChatBubble'
import Marketplace from './pages/Marketplace'

function AppShell() {
	const location = useLocation();
	const hideChat = location.pathname.startsWith('/login') || location.pathname.startsWith('/register') || location.pathname.startsWith('/chatbot');
	return (
		<>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/chatbot" element={<ChatbotAI />} />
				<Route path="/marketplace" element={<Marketplace />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
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
