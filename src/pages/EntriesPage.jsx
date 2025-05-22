// src/pages/EntriesPage.jsx
import { useContext, useEffect, useState, useMemo } from 'react';
import { SupabaseContext } from '../App';
import EditEntryModal   from '../components/EditEntryModal';
import AddEntryModal    from '../components/AddEntryModal';
import EntriesExport    from '../components/EntriesExport';
import './EntriesPage.css';
import {
  Plus,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil
} from 'lucide-react';
import * as XLSX from 'xlsx';

function ImportModal({ onClose, onImport }) {
  const supabase = useContext(SupabaseContext);
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('glovo');

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>Importă Raport</h2>
        <select
          className="input"
          value={platform}
          onChange={e => setPlatform(e.target.value)}
        >
          <option value="glovo">Glovo</option>
          <option value="bringo">Bringo</option>
          <option value="tazz">Tazz</option>
        </select>
        <input
          className="input"
          type="file"
          accept=".xlsx,.xls"
          onChange={e => setFile(e.target.files[0])}
        />
        <div className="modal-actions">
          <button
            className="btn blue"
            onClick={() =>
              file ? onImport(platform, file, supabase) 
                   : alert('Selectează un fișier Excel')
            }
          >
            Importă
          </button>
          <button className="btn gray" onClick={onClose}>
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EntriesPage() {
  const supabase = useContext(SupabaseContext);

  const [entries, setEntries]         = useState([]);
  const [rawReports, setRawReports]   = useState([]);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [showAdd, setShowAdd]       = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editEntry, setEditEntry]   = useState(null);

  useEffect(() => {
    loadEntries();
    loadRawReports();
  }, []);

  async function loadEntries() {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const { data: prof } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
    if (!prof?.organization_id) return;

    const { data, error } = await supabase
      .from('entries')
      .select(`
        id,
        nume,
        prenume,
        email,
        telefon,
        platforma,
        created_at,
        salariu_total,
        modified
      `)
      .eq('organization_id', prof.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load entries error:', error);
    } else {
      setEntries(
        (data || []).map(e => ({
          id: e.id,
          full_name: `${e.nume} ${e.prenume}`.trim(),
          email: e.email,
          phone: e.telefon,
          platform: e.platforma,
          created_at: e.created_at,
          salariu_total: e.salariu_total,
          modified: e.modified
        }))
      );
    }
  }

  async function loadRawReports() {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const { data: prof } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
    if (!prof?.organization_id) return;

    const { data, error } = await supabase
      .from('report_raw')
      .select(`
        id,
        entry_id,
        full_name,
        email,
        phone,
        platform,
        report_date,
        gross_amount as salariu_total
      `)
      .eq('organization_id', prof.organization_id)
      .order('imported_at', { ascending: false });

    if (error) {
      console.error('Load rawReports error:', error);
    } else {
      setRawReports(
        (data || []).map(r => ({
          id: r.id,
          full_name: r.full_name,
          email: r.email,
          phone: r.phone,
          platform: r.platform,
          created_at: r.report_date,
          salariu_total: r.salariu_total,
          modified: false
        }))
      );
    }
  }

  const dataset = entries.length > 0 ? entries : rawReports;

  const platforms = useMemo(
    () => [...new Set(dataset.map(e => e.platform).filter(Boolean))],
    [dataset]
  );

  const filtered = useMemo(() => {
    return dataset.filter(e => {
      const txt = search.toLowerCase();
      const okSearch =
        e.full_name.toLowerCase().includes(txt) ||
        (e.email || '').toLowerCase().includes(txt) ||
        (e.phone || '').includes(txt);
      const okStatus =
        filterStatus === 'all' ||
        (filterStatus === 'modified' && e.modified) ||
        (filterStatus === 'draft' && !e.modified);
      const okPlat = !filterPlatform || e.platform === filterPlatform;
      return okSearch && okStatus && okPlat;
    });
  }, [dataset, search, filterStatus, filterPlatform]);

  const total      = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const pageData   = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const toggleSelect = id =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  const selectPage = e =>
    setSelectedIds(
      e.target.checked ? pageData.map(r => r.id) : []
    );
  const clearSel = () => setSelectedIds([]);

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (!confirm(`Ștergi ${selectedIds.length} înregistrări?`)) return;
    const { error } = await supabase
      .from('entries')
      .delete()
      .in('id', selectedIds);
    if (error) alert('Eroare: ' + error.message);
    else {
      clearSel();
      loadEntries();
      if (entries.length === 0) loadRawReports();
    }
  }

  async function handleImport(platform, file) {
    const buf = await file.arrayBuffer();
    const wb  = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows  = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session.user.id;
    const { data: prof } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    const payload = rows.map(r => {
      const nameParts = (r['Nume complet'] || '').split(' ');
      return {
        nume: nameParts[0] || '',
        prenume: nameParts.slice(1).join(' ') || '',
        email: r['Email'] || null,
        telefon: r['Telefon'] || null,
        platforma: platform,
        created_at: r['Data'] ? new Date(r['Data']).toISOString() : new Date().toISOString(),
        salariu_total: Number(r['Sumă'] || r['Venit brut'] || 0),
        organization_id: prof.organization_id
      };
    });

    const { error } = await supabase.from('entries').insert(payload);
    if (error) alert('Eroare import: ' + error.message);
    else {
      alert('Import reușit!');
      loadEntries();
    }
    setShowImport(false);
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, total);

  return (
    <div className="entries-page">
      {/* acțiuni + filtre */}
      <div className="actions-filters">
        <div className="left-controls">
          <button className="btn blue" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Adaugă
          </button>
          <button className="btn gray" onClick={() => setShowImport(true)}>
            <Upload size={16} /> Import
          </button>
          {selectedIds.length > 0 && (
            <button className="btn red" onClick={deleteSelected}>
              <Trash2 size={16} /> Șterge ({selectedIds.length})
            </button>
          )}
        </div>
        <div className="filters-inline">
          <input
            className="input"
            placeholder="Caută..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <select
            className="input"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">Toate</option>
            <option value="modified">Modificate</option>
            <option value="draft">Draft</option>
          </select>
          <select
            className="input"
            value={filterPlatform}
            onChange={e => { setFilterPlatform(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Toate platformele</option>
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <EntriesExport data={filtered} />
        </div>
      </div>

      {/* tabel */}
      <table className="entries-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={selectPage}
                checked={
                  pageData.length > 0 &&
                  pageData.every(r => selectedIds.includes(r.id))
                }
              />
            </th>
            <th>Status</th>
            <th>Nume complet</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Platformă</th>
            <th>Dată</th>
            <th>Salariu</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map(e => (
            <tr key={e.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(e.id)}
                  onChange={() => toggleSelect(e.id)}
                />
              </td>
              <td>{e.modified ? '🔵' : '⚪'}</td>
              <td>{e.full_name}</td>
              <td>{e.email}</td>
              <td>{e.phone}</td>
              <td>{e.platform}</td>
              <td>{e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}</td>
              <td>{e.salariu_total ?? '—'}</td>
              <td>
                <button
                  className="icon-btn"
                  onClick={() => { setEditEntry(e); setShowEdit(true); }}
                >
                  <Pencil size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* paginare */}
      <div className="pagination-footer">
        <span>Showing {start}–{end} of {total}</span>
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* modale */}
      {showAdd && (
        <AddEntryModal onAdded={loadEntries} onClose={() => setShowAdd(false)} />
      )}
      {showEdit && editEntry && (
        <EditEntryModal
          entry={editEntry}
          onClose={() => { setShowEdit(false); loadEntries(); }}
        />
      )}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
