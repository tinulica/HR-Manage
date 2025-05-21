import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import EntriesPage from './pages/EntriesPage'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'

function AppLayout() {
  return (
    <>
      <Sidebar />
      <Header />
      <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="*" element={<Navigate to="/entries" />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  if (loading) return <p className="p-4">Se încarcă...</p>

  return (
    <BrowserRouter>
      <Routes>
        {!session && <Route path="/" element={<LoginPage />} />}
        {session && <Route path="/*" element={<AppLayout />} />}
        <Route path="*" element={<Navigate to={session ? '/entries' : '/'} />} />
      </Routes>
    </BrowserRouter>
  )
}
