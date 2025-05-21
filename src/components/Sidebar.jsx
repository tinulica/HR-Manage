import { Home, Users, BarChart3 } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import './Sidebar.css'

export default function Sidebar() {
  const location = useLocation()
  const [orgName, setOrgName] = useState('Organizația Mea')

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_org_name as displayOrgName')
        .eq('id', userId)
        .single()

      if (!profileError && profile?.displayOrgName) {
        setOrgName(profile.displayOrgName)
      }
    }
    load()
  }, [])

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Entries', path: '/entries', icon: <Users size={18} /> },
    { name: 'Statistici', path: '/analytics', icon: <BarChart3 size={18} /> }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">{orgName}</span>
      </div>

      <div className="sidebar-menu-area">
        <ul className="sidebar-menu">
          {navItems.map(item => (
            <li key={item.path}>
              <Link to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}>
                <span className="menu-icon">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
