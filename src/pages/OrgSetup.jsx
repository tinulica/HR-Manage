// src/pages/OrgSetup.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './OrgSetup.css'

export default function OrgSetup() {
  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) return
      setUserId(session.user.id)
    }
    getUser()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orgName.trim()) return
    if (!userId) return alert('Nu ești autentificat')

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName.trim(), description: orgDescription.trim() })
      .select()
      .single()

    if (orgError) return alert('Eroare: ' + orgError.message)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ organization_id: org.id, role: 'admin' })
      .eq('id', userId)

    if (profileError) return alert('Eroare: ' + profileError.message)

    navigate('/dashboard')
  }

  if (!userId) return <p className="p-6">Se încarcă...</p>

  return (
    <div className="org-setup-container">
      <form onSubmit={handleSubmit} className="org-setup-card">
        <h1 className="org-setup-title">Setează organizația ta</h1>
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Nume organizație"
          className="org-setup-input"
        />
        <textarea
          value={orgDescription}
          onChange={(e) => setOrgDescription(e.target.value)}
          placeholder="Descriere (opțional)"
          className="org-setup-textarea"
        />
        <button type="submit" className="org-setup-button">
          Creează organizația
        </button>
      </form>
    </div>
  )
}
