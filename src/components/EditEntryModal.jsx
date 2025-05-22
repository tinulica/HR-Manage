// src/components/EditEntryModal.jsx
// src/components/EditEntryModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import './EditEntryModal.css';
import imageCompression from 'browser-image-compression';
import SupabaseContext from '../contexts/SupabaseContext'; // ✅ Corrected import


export default function EditEntryModal({ entry, onClose }) {
  const supabase = useContext(SupabaseContext);

  const [tab, setTab] = useState('general');
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
    end_date: form?.end_date || '',
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
  });
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [salaryFrom, setSalaryFrom] = useState('');
  const [salaryTo, setSalaryTo] = useState('');
  const [documents, setDocuments] = useState([]);
  const [shares, setShares] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      const [
        { data: docs },
        { data: sh },
        { data: sal },
        { data: orgs }
      ] = await Promise.all([
        supabase
          .from('entry_documents')
          .select('*')
          .eq('entry_id', entry.id),
        supabase
          .from('entry_shares')
          .select('*, organization:shared_with_org_id (name)')
          .eq('entry_id', entry.id),
        supabase
          .from('salaries')
          .select('*')
          .eq('entry_id', entry.id),
        supabase
          .from('organizations')
          .select('id, name')
          .neq('id', entry.organization_id)
      ]);

      setDocuments(docs || []);
      setShares(sh || []);
      setSalaries(sal || []);
      setFilteredSalaries(sal || []);
      setOrganizations(orgs || []);
    };
    fetchAll();
  }, [supabase, entry.id, entry.organization_id]);

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const saveGeneral = async () => {
    const { error } = await supabase
      .from('entries')
      .update({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        platform: form.platform,
        platform_id: form.platform_id
      })
      .eq('id', entry.id);

    if (error) alert('Eroare la salvarea datelor personale: ' + error.message);
    else alert('Date personale salvate');
  };

  const saveCollab = async () => {
    const updates = {
      tip_colaborare: form.tip_colaborare,
      commission: parseFloat(form.commission)
    };
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
      });
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
      });
    }
    const { error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', entry.id);

    if (error) alert('Eroare la salvarea colaborării: ' + error.message);
    else alert('Colaborare salvată');
  };

  const fetchSalaryRange = () => {
    if (!salaryFrom || !salaryTo) return alert('Selectează intervalul');
    const fromDate = new Date(salaryFrom);
    const toDate = new Date(salaryTo);
    const filtered = salaries.filter(s => {
      const d = new Date(s.saptamana);
      return d >= fromDate && d <= toDate;
    });
    setFilteredSalaries(filtered);
  };

  const addSalary = () =>
    setFilteredSalaries(prev => [
      ...prev,
      { entry_id: entry.id, saptamana: '', suma: '', ore: '', platforma: '' }
    ]);

  const editSalary = (idx, field, val) =>
    setFilteredSalaries(prev =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );

  const saveSalaries = async () => {
    const toSave = filteredSalaries.length ? filteredSalaries : salaries;
    const { error } = await supabase.from('salaries').upsert(toSave);
    if (error) alert('Eroare la salvarea salariilor: ' + error.message);
    else alert('Salarii salvate');
  };

  const uploadDoc = async e => {
    const file = e.target.files[0];
    if (!file || file.size > 2 * 1024 * 1024)
      return alert('Fișier prea mare');

    const comp = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024
    });
    const path = `documents/${entry.id}_${Date.now()}_${file.name}`;
    const { data, error: upError } = await supabase
      .storage
      .from('entry-documents')
      .upload(path, comp);

    if (upError) return alert(upError.message);

    await supabase
      .from('entry-documents')
      .insert({ entry_id: entry.id, file_name: file.name, file_url: data.path });

    const { data: docs } = await supabase
      .from('entry-documents')
      .select('*')
      .eq('entry_id', entry.id);

    setDocuments(docs || []);
  };

  const deleteDoc = async doc => {
    await supabase.storage.from('entry-documents').remove([doc.file_url]);
    await supabase.from('entry-documents').delete().eq('id', doc.id);
    setDocuments(prev => prev.filter(x => x.id !== doc.id));
  };

  const shareEntry = async () => {
    if (!selectedOrg || !form.commission)
      return alert('Selectează organizație și comision');

    const { error } = await supabase
      .from('entry_shares')
      .insert({
        entry_id: entry.id,
        shared_with_org_id: selectedOrg,
        commission_for_owner: parseFloat(form.commission)
      });

    if (error) return alert(error.message);

    const { data } = await supabase
      .from('entry_shares')
      .select('*, organization:shared_with_org_id (name)')
      .eq('entry_id', entry.id);

    setShares(data || []);
    setSelectedOrg('');
  };

  const unshare = async id => {
    await supabase.from('entry_shares').delete().eq('id', id);
    setShares(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Edit Entry</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-tabs">
          {['general', 'collab', 'salary', 'docs', 'share'].map(t => (
            <button
              key={t}
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="modal-content">
          {tab === 'general' && (
            <div className="tab-content">
              <input
                value={form.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                placeholder="Nume complet"
              />
              <input
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="Email"
              />
              <input
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="Telefon"
              />
              <input
                value={form.platform}
                onChange={e => handleChange('platform', e.target.value)}
                placeholder="Platformă"
              />
              <input
                value={form.platform_id}
                onChange={e => handleChange('platform_id', e.target.value)}
                placeholder="ID Platformă"
              />
              <button onClick={saveGeneral}>Salvează general</button>
            </div>
          )}

          {/* ...collab, salary, docs, share tabs unchanged... */}
        </div>
      </div>
    </div>
  );
}
