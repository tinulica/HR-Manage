// src/components/Header.jsx
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { ChevronDown, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProfileModal from './ProfileModal'
import './Header.css'

export default function Header() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      if (!currentUser) return
      setUser(currentUser)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_org_name as displayOrgName, profile_pic')
        .eq('id', currentUser.id)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData)
      }
    }
    loadUser()

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const avatarUrl =
    profile?.profile_pic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile?.displayOrgName || user?.email || 'User'
    )}&background=random`

  return (
    <header className="topbar">
      <div className="topbar-profile" ref={dropdownRef}>
        <button
          className="topbar-profile-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img
            src={avatarUrl}
            alt="user avatar"
            className="avatar"
          />
          <span className="username">
            {profile?.displayOrgName || user?.email}
          </span>
          <ChevronDown size={18} />
        </button>

        {dropdownOpen && (
          <div className="topbar-menu">
            <button onClick={() => {
              setDropdownOpen(false)
              setShowProfileModal(true)
            }}>Profil</button>

            <button onClick={() => {
              alert('Integrare – funcționalitate în lucru')
              setDropdownOpen(false)
            }}>Integrare</button>

            <button onClick={handleLogout} className="logout">
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </header>
  )
}