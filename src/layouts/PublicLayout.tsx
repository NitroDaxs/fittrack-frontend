import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import TopNav from './TopNav'
import Footer from './Footer'
import BottomNav from './BottomNav'
import ChatBubble from '../components/chat/ChatBubble'
import { useAuth } from '../context/AuthContext'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-grow pt-20 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      {/* Keyed by user so a different account never inherits this one's panel state. */}
      {user ? <ChatBubble key={user.id} userId={user.id} /> : null}
    </div>
  )
}
