// WowDash-styled ProfileModal - JSX only
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import imageCompression from 'browser-image-compression'
import './ProfileModal.css'

export default function ProfileModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [profile, setProfile] = useState(null)
  const [org, setOrg] = useState(null)
  const [users, setUsers] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const maxSizeMB = 2

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      if (profileData.role === 'admin') {
        setIsAdmin(true)
        const { data: orgData } = await supabase.from('organizations').select('*').eq('id', profileData.organization_id).single()
        setOrg(orgData)

        const { data: userList } = await supabase.from('profiles').select('*').eq('organization_id', profileData.organization_id)
        setUsers(userList)
      }
    }
    fetchData()
  }, [])

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })
  const handleOrgChange = (e) => setOrg({ ...org, [e.target.name]: e.target.value })

  const handleSaveProfile = async () => {
    await supabase.from('profiles').update({ full_name: profile.full_name, username: profile.username }).eq('id', profile.id)
    alert('Profil salvat')
  }

  const handleSaveOrg = async () => {
    await supabase.from('organizations').update({ name: org.name, description: org.description }).eq('id', org.id)
    alert('Organizație salvată')
  }

  const handlePasswordChange = async () => {
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      alert('Parolă invalidă sau neconfirmată corect.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) alert('Eroare: ' + error.message)
    else alert('Parola a fost schimbată.')
  }

  const handleUploadImage = async (file, folder, column) => {
    if (!file || file.size > maxSizeMB * 1024 * 1024) return alert('Fișier prea mare.')
    const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 })
    const filePath = `${folder}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from(folder).upload(filePath, compressed)
    if (error) return alert('Eroare la upload.')
    const url = supabase.storage.from(folder).getPublicUrl(filePath).data.publicUrl
    if (column === 'profile_pic') {
      await supabase.from('profiles').update({ profile_pic: url }).eq('id', profile.id)
      setProfile({ ...profile, profile_pic: url })
    } else if (column === 'logo_url') {
      await supabase.from('organizations').update({ logo_url: url }).eq('id', org.id)
      setOrg({ ...org, logo_url: url })
    }
  }

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="modal-top">
          <h3>Setări cont</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="tab-buttons">
          <button className={activeTab === 'personal' ? 'tab-active' : ''} onClick={() => setActiveTab('personal')}>Profil</button>
          {isAdmin && <button className={activeTab === 'org' ? 'tab-active' : ''} onClick={() => setActiveTab('org')}>Organizație</button>}
          <button className={activeTab === 'security' ? 'tab-active' : ''} onClick={() => setActiveTab('security')}>Securitate</button>
          {isAdmin && <button className={activeTab === 'team' ? 'tab-active' : ''} onClick={() => setActiveTab('team')}>Echipă</button>}
        </div>

        <div className="profile-content">
          {activeTab === 'personal' && profile && (
            <div className="tab-section">
              <div className="avatar-wrap">
                <img src={profile.profile_pic} alt="Profil" />
                <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e.target.files[0], 'avatars', 'profile_pic')} />
              </div>
              <div className="form-group">
                <input name="full_name" value={profile.full_name || ''} onChange={handleProfileChange} placeholder="Nume complet" />
                <input name="username" value={profile.username || ''} onChange={handleProfileChange} placeholder="Username" />
                <input value={profile.email || ''} disabled />
                <button onClick={handleSaveProfile} className="btn primary">Salvează</button>
              </div>
            </div>
          )}

          {activeTab === 'org' && org && (
            <div className="tab-section">
              <div className="avatar-wrap">
                <img src={org.logo_url} alt="Logo" />
                <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e.target.files[0], 'org-logos', 'logo_url')} />
              </div>
              <div className="form-group">
                <input name="name" value={org.name || ''} onChange={handleOrgChange} placeholder="Nume organizație" />
                <textarea name="description" value={org.description || ''} onChange={handleOrgChange} placeholder="Descriere" />
                <button onClick={handleSaveOrg} className="btn success">Salvează</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="form-group">
              <input type="password" placeholder="Parolă nouă" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <input type="password" placeholder="Confirmă parola" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button onClick={handlePasswordChange} className="btn warning">Schimbă parola</button>
            </div>
          )}

          {activeTab === 'team' && isAdmin && (
            <div className="form-group">
              {users.map((u) => (
                <div key={u.id} className="team-row">
                  <span>{u.full_name} ({u.email})</span>
                  {u.role !== 'admin' && (
                    <button onClick={() => {
                      supabase.from('profiles').update({ role: 'admin' }).eq('id', u.id)
                      window.location.reload()
                    }} className="btn promote">Promovează</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
