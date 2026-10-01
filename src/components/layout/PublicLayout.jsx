import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import TopNav from './TopNav'
import Footer from './Footer'
import BottomNav from './BottomNav'
import ChatWidget from '../chat/ChatWidget'

export default function PublicLayout() {
  const { pathname } = useLocation()

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
      <ChatWidget />
    </div>
  )
}
