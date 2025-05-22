import { useState } from 'react'
import { useContext } from 'react';
import { SupabaseContext } from '../App';
import './AddEntryModal.css'

export default function AddEntryModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    platform: 'glovo',
    collab_type: 'angajare'
  })
  const [loading, setLoading] = useState(false)
const supabase = useContext(SupabaseContext);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) {
      alert('Utilizator invalid.')
      setLoading(false)
      return
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single()
    if (profileError || !profile?.organization_id) {
      alert('Organizație inexistentă.')
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('entries')
      .insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        platform: form.platform,
        collab_type: form.collab_type,
        organization_id: profile.organization_id,
        created_by: userId
      })
    setLoading(false)
    if (error) {
      alert('Eroare la salvare: ' + error.message)
    } else {
      onAdded(data)
      onClose()
    }
  }

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <div className="custom-modal-header">
          <h4>Adaugă Persoană</h4>
          <button onClick={onClose} className="custom-modal-close">&times;</button>
        </div>
        <div className="custom-modal-body">
          <input
            name="full_name"
            className="custom-input"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Nume complet"
          />
          <input
            name="email"
            className="custom-input"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <input
            name="phone"
            className="custom-input"
            value={form.phone}
            onChange={handleChange}
            placeholder="Telefon"
          />
          <select
            name="platform"
            className="custom-input"
            value={form.platform}
            onChange={handleChange}
          >
            <option value="glovo">Glovo</option>
            <option value="bringo">Bringo</option>
            <option value="tazz">Tazz</option>
            <option value="wolt">Wolt</option>
          </select>
          <input
            name="collab_type"
            className="custom-input"
            value={form.collab_type}
            onChange={handleChange}
            placeholder="Tip colaborare"
          />
        </div>
        <div className="custom-modal-footer">
          <button className="custom-btn cancel" onClick={onClose}>Anulează</button>
          <button
            className="custom-btn primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>
    </div>
  )
}