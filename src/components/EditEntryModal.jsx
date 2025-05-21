import React, { useState, useEffect } from 'react'
import './EditEntryModal.css'
import { supabase } from '../supabaseClient'
import imageCompression from 'browser-image-compression'

export default function EditEntryModal({ entry, onClose }) {
  const [tab, setTab] = useState('general')
  const [form, setForm] = useState({
    full_name: entry.full_name || '',
    email: entry.email || '',
    phone: entry.phone || '',
    platform: entry.platform || '',
    platform_id: entry.platform_id || '',
    tip_colaborare: entry.tip_colaborare || 'angajare_directa',
    cnp: entry.cnp || '',
    address: entry.address || '',
    id_series: entry.id_series || '',
    id_number: entry.id_number || '',
    id_issuer: entry.id_issuer || '',
    id_issue_date: entry.id_issue_date || '',
    id_expiry_date: entry.id_expiry_date || '',
    contract_number: entry.contract_number || '',
    contract_issue_date: entry.contract_issue_date || '',
    activity_start_date: entry.activity_start_date || '',
    work_norm: entry.work_norm || '8h',
    alt_job_label: entry.alt_job_label || '',
    commission: entry.commission || '',
    end_date: entry.end_date || '',
    admin_cnp: entry.admin_cnp || '',
    admin_address: entry.admin_address || '',
    admin_id_series: entry.admin_id_series || '',
    admin_id_number: entry.admin_id_number || '',
    admin_id_issuer: entry.admin_id_issuer || '',
    admin_issue_date: entry.admin_issue_date || '',
    admin_expiry_date: entry.admin_expiry_date || '',
    comp_name: entry.comp_name || '',
    vat_payer: entry.vat_payer || false,
    cui: entry.cui || '',
    registry_nr: entry.registry_nr || '',
    country: entry.country || '',
    county: entry.county || '',
    city: entry.city || '',
    comp_address: entry.comp_address || '',
    iban: entry.iban || '',
    collab_start_date: entry.collab_start_date || ''
  })
  const [salaries, setSalaries] = useState([])
  const [filteredSalaries, setFilteredSalaries] = useState([])
  const [salaryFrom, setSalaryFrom] = useState('')
  const [salaryTo, setSalaryTo] = useState('')
  const [documents, setDocuments] = useState([])
  const [shares, setShares] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: docs }, { data: sh }, { data: sal }, { data: orgs }] = await Promise.all([
        supabase.from('entry_documents').select('*').eq('entry_id', entry.id),
        supabase.from('entry_shares').select('*, organization:shared_with_org_id (name)').eq('entry_id', entry.id),
        supabase.from('salaries').select('*').eq('entry_id', entry.id),
        supabase.from('organizations').select('id, name').neq('id', entry.organization_id)
      ])
      setDocuments(docs || [])
      setShares(sh || [])
      setSalaries(sal || [])
      setFilteredSalaries(sal || [])
      setOrganizations(orgs || [])
    }
    fetchAll()
  }, [entry.id, entry.organization_id])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const saveGeneral = async () => {
    const { error } = await supabase.from('entries').update({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      platform: form.platform,
      platform_id: form.platform_id
    }).eq('id', entry.id)
    if (error) alert('Eroare la salvarea datelor personale: ' + error.message)
    else alert('Date personale salvate')
  }

  const saveCollab = async () => {
    const updates = { tip_colaborare: form.tip_colaborare, commission: parseFloat(form.commission) }
    if (form.tip_colaborare === 'angajare_directa') {
      Object.assign(updates, {
        cnp: form.cnp,
        address: form.address,
        id_series: form.id_series,
        id_number: form.id_number,
        id_issuer: form.id_issuer,
        id_issue_date: form.id_issue_date,
        id_expiry_date: form.id_expiry_date,
        contract_number: form.contract_number,
        contract_issue_date: form.contract_issue_date,
        activity_start_date: form.activity_start_date,
        work_norm: form.work_norm,
        alt_job_label: form.alt_job_label,
        end_date: form.end_date
      })
    } else if (form.tip_colaborare === 'colaborare_srl_pfa') {
      Object.assign(updates, {
        admin_cnp: form.admin_cnp,
        admin_address: form.admin_address,
        admin_id_series: form.admin_id_series,
        admin_id_number: form.admin_id_number,
        admin_id_issuer: form.admin_id_issuer,
        admin_issue_date: form.admin_issue_date,
        admin_expiry_date: form.admin_expiry_date,
        comp_name: form.comp_name,
        vat_payer: form.vat_payer,
        cui: form.cui,
        registry_nr: form.registry_nr,
        country: form.country,
        county: form.county,
        city: form.city,
        comp_address: form.comp_address,
        iban: form.iban,
        collab_start_date: form.collab_start_date
      })
    }
    const { error } = await supabase.from('entries').update(updates).eq('id', entry.id)
    if (error) alert('Eroare la salvarea colaborării: ' + error.message)
    else alert('Colaborare salvată')
  }

  const fetchSalaryRange = () => {
    if (!salaryFrom || !salaryTo) return alert('Selectează intervalul')
    const fromDate = new Date(salaryFrom)
    const toDate = new Date(salaryTo)
    const filtered = salaries.filter(s => {
      const d = new Date(s.saptamana)
      return d >= fromDate && d <= toDate
    })
    setFilteredSalaries(filtered)
  }

  const addSalary = () => setFilteredSalaries(prev => [...prev, { entry_id: entry.id, saptamana: '', suma: '', ore: '', platforma: '' }])
  const editSalary = (idx, field, val) => setFilteredSalaries(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))
  const saveSalaries = async () => {
    const toSave = filteredSalaries.length ? filteredSalaries : salaries
    const { error } = await supabase.from('salaries').upsert(toSave)
    if (error) alert('Eroare la salvarea salariilor: ' + error.message)
    else alert('Salarii salvate')
  }

  const uploadDoc = async e => {
    const file = e.target.files[0]
    if (!file || file.size > 2 * 1024 * 1024) return alert('Fișier prea mare')
    const comp = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 })
    const path = `documents/${entry.id}_${Date.now()}_${file.name}`
    const { data, error: up } = await supabase.storage.from('entry-documents').upload(path, comp)
    if (up) return alert(up.message)
    await supabase.from('entry-documents').insert({ entry_id: entry.id, file_name: file.name, file_url: data.path })
    const { data: docs } = await supabase.from('entry-documents').select('*').eq('entry_id', entry.id)
    setDocuments(docs || [])
  }

  const deleteDoc = async d => {
    await supabase.storage.from('entry-documents').remove([d.file_url])
    await supabase.from('entry-documents').delete().eq('id', d.id)
    setDocuments(prev => prev.filter(x => x.id !== d.id))
  }

  const shareEntry = async () => {
    if (!selectedOrg || !form.commission) return alert('Selectează organizație și comision')
    const { error } = await supabase.from('entry_shares').insert({ entry_id: entry.id, shared_with_org_id: selectedOrg, commission_for_owner: parseFloat(form.commission) })
    if (error) return alert(error.message)
    const { data } = await supabase.from('entry_shares').select('*, organization:shared_with_org_id (name)').eq('entry_id', entry.id)
    setShares(data || [])
    setSelectedOrg('')
  }

  const unshare = async id => { await supabase.from('entry_shares').delete().eq('id', id); setShares(prev => prev.filter(s => s.id !== id)) }

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Edit Entry</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-tabs">
          {['general', 'collab', 'salary', 'docs', 'share'].map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="modal-content">
          {tab === 'general' && (
            <div className="tab-content">
              <input value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} placeholder="Nume complet" />
              <input value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="Email" />
              <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="Telefon" />
              <input value={form.platform} onChange={e => handleChange('platform', e.target.value)} placeholder="Platformă" />
              <input value={form.platform_id} onChange={e => handleChange('platform_id', e.target.value)} placeholder="ID Platformă" />
              <button onClick={saveGeneral}>Salvează general</button>
            </div>
          )}

          {tab === 'collab' && (
            <div className="tab-content">
              <select value={form.tip_colaborare} onChange={e => handleChange('tip_colaborare', e.target.value)}>
                <option value="angajare_directa">Angajare Directă</option>
                <option value="colaborare_srl_pfa">Colaborare SRL/PFA</option>
                <option value="detasare">Detașare</option>
              </select>
              {form.tip_colaborare === 'angajare_directa' && (
                <>
                  <input value={form.cnp} onChange={e => handleChange('cnp', e.target.value)} placeholder="CNP" />
                  <input value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Adresă domiciliu" />
                  <input value={form.id_series} onChange={e => handleChange('id_series', e.target.value)} placeholder="Serie act identitate" />
                  <input value={form.id_number} onChange={e => handleChange('id_number', e.target.value)} placeholder="Număr act identitate" />
                  <input value={form.id_issuer} onChange={e => handleChange('id_issuer', e.target.value)} placeholder="Emitent" />
                  <input type="date" value={form.id_issue_date} onChange={e => handleChange('id_issue_date', e.target.value)} />
                  <input type="date" value={form.id_expiry_date} onChange={e => handleChange('id_expiry_date', e.target.value)} />
                  <input value={form.contract_number} onChange={e => handleChange('contract_number', e.target.value)} placeholder="Nr. contract" />
                  <input type="date" value={form.contract_issue_date} onChange={e => handleChange('contract_issue_date', e.target.value)} />
                  <input type="date" value={form.activity_start_date} onChange={e => handleChange('activity_start_date', e.target.value)} />
                  <select value={form.work_norm} onChange={e => handleChange('work_norm', e.target.value)}>
                    <option value="8h">8h</option>
                    <option value="student">Student</option>
                    <option value="elev">Elev</option>
                    <option value="pensionar">Pensionar</option>
                    <option value="alt_loc_de_munca">Alt loc muncă</option>
                  </select>
                  {['student','elev','pensionar','alt_loc_de_munca'].includes(form.work_norm) && (
                    <input value={form.alt_job_label} onChange={e => handleChange('alt_job_label', e.target.value)} placeholder="Alt angajator" />
                  )}
                  <input value={form.commission} onChange={e => handleChange('commission', e.target.value)} placeholder="Comision (%)" />
                  <input type="date" value={form.end_date} onChange={e => handleChange('end_date', e.target.value)} />
                </>
              )}
              {form.tip_colaborare === 'colaborare_srl_pfa' && (
                <>
                  <h4>Administrator</h4>
                  <input value={form.admin_cnp} onChange={e => handleChange('admin_cnp', e.target.value)} placeholder="CNP admin" />
                  <input value={form.admin_address} onChange={e => handleChange('admin_address', e.target.value)} placeholder="Adresă admin" />
                  <input value={form.admin_id_series} onChange={e => handleChange('admin_id_series', e.target.value)} placeholder="Serie admin" />
                  <input value={form.admin_id_number} onChange={e => handleChange('admin_id_number', e.target.value)} placeholder="Număr admin" />
                  <input type="date" value={form.admin_issue_date} onChange={e => handleChange('admin_issue_date', e.target.value)} />
                  <input type="date" value={form.admin_expiry_date} onChange={e => handleChange('admin_expiry_date', e.target.value)} />
                  <h4>Companie</h4>
                  <input value={form.comp_name} onChange={e => handleChange('comp_name', e.target.value)} placeholder="Denumire firmă" />
                  <label><input type="checkbox" checked={form.vat_payer} onChange={e => handleChange('vat_payer', e.target.checked)} />Plătitor TVA</label>
                  <input value={form.cui} onChange={e => handleChange('cui', e.target.value)} placeholder="CUI" />
                  <input value={form.registry_nr} onChange={e => handleChange('registry_nr', e.target.value)} placeholder="Nr. Registru" />
                  <input value={form.country} onChange={e => handleChange('country', e.target.value)} placeholder="Țară" />
                  <input value={form.county} onChange={e => handleChange('county', e.target.value)} placeholder="Județ" />
                  <input value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="Localitate" />
                  <input value={form.comp_address} onChange={e => handleChange('comp_address', e.target.value)} placeholder="Adresă firmă" />
                  <input value={form.iban} onChange={e => handleChange('iban', e.target.value)} placeholder="IBAN" />
                  <input type="date" value={form.collab_start_date} onChange={e => handleChange('collab_start_date', e.target.value)} />
                </>
              )}
              {form.tip_colaborare === 'detasare' && <p>Detașare: contactează firma detașatoare.</p>}
              <button onClick={saveCollab}>Salvează colaborare</button>
            </div>
          )}

          {tab === 'salary' && (
            <div className="tab-content">
              <div className="salary-filter">
                <label>De la: <input type="date" value={salaryFrom} onChange={e => setSalaryFrom(e.target.value)} /></label>
                <label>Până la: <input type="date" value={salaryTo} onChange={e => setSalaryTo(e.target.value)} /></label>
                <button onClick={fetchSalaryRange}>Filtrează</button>
              </div>

              {(filteredSalaries.length ? filteredSalaries : salaries).map((s, i) => (
                <div key={i} className="salary-row">
                  <input type="date" value={s.saptamana} onChange={e => editSalary(i, 'saptamana', e.target.value)} />
                  <input value={s.suma} onChange={e => editSalary(i, 'suma', e.target.value)} placeholder="Sumă" />
                  <input value={s.ore} onChange={e => editSalary(i, 'ore', e.target.value)} placeholder="Ore" />
                  <input value={s.platforma} onChange={e => editSalary(i, 'platforma', e.target.value)} placeholder="Platformă" />
                </div>
              ))}
              <div className="salary-actions">
                <button onClick={addSalary}>Adaugă rând</button>
                <button onClick={saveSalaries}>Salvează salarii</button>
              </div>
            </div>
          )}

          {tab === 'docs' && (
            <div className="tab-content">
              <input type="file" onChange={uploadDoc} /> 
              <ul className="file-list">
                {documents.map(d => (
                  <li className="file-item" key={d.id}>
                    <a href={`https://fxvuvhnprzrtdbizziab.supabase.co/storage/v1/object/public/entry-documents/${d.file_url}`} target="_blank" rel="noreferrer">{d.file_name}</a>
                    <button onClick={() => deleteDoc(d)}>Șterge</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'share' && (
            <div className="tab-content">
              <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)}>
                <option value="">Selectează organizație</option>
                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <input type="number" min="0" max="100" value={form.commission} onChange={e => handleChange('commission', e.target.value)} placeholder="Comision (%)" />
              <button onClick={shareEntry}>Trimite Share</button>
              <h4>Share-uri active</h4>
              <ul className="file-list">
                {shares.map(s => (
                  <li className="file-item" key={s.id}>{s.organization?.name} - {s.commission_for_owner}%<button onClick={() => unshare(s.id)}>Oprește</button></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
