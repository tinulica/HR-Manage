// src/components/EntriesExport.jsx
import { useState } from 'react'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import './EntriesExport.css'

export default function EntriesExport({ data }) {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedFields, setSelectedFields] = useState([
    'full_name',
    'email',
    'phone',
    'platform',
    'gross_amount',
    'hours'
  ])

  const allFields = [
    { key: 'full_name', label: 'Nume complet' },
    { key: 'email',      label: 'Email' },
    { key: 'phone',      label: 'Telefon' },
    { key: 'platform',   label: 'Platformă' },
    { key: 'platform_id',label: 'ID Platformă' },
    { key: 'report_date',label: 'Data Raport' },
    { key: 'gross_amount', label: 'Venit Brut' },
    { key: 'hours',      label: 'Ore' },
    { key: 'entry_id',   label: 'ID Entry' },
    { key: 'organization_id', label: 'ID Organizație' }
  ]

  const toggleField = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const handleExport = () => {
    // Build rows only with selected fields
    const exportData = data.map(entry => {
      const row = {}
      selectedFields.forEach(field => {
        row[field] = entry[field]
      })
      return row
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'EntriesExport')
    XLSX.writeFile(wb, 'entries_export.xlsx')
    setShowOptions(false)
  }

  return (
    <div className="export-dropdown">
      <button
        className="btn indigo"
        onClick={() => setShowOptions(prev => !prev)}
      >
        <Download size={16} /> Export
      </button>
      {showOptions && (
        <div className="dropdown-panel">
          <h4>Selectează coloane</h4>
          <div className="fields-list">
            {allFields.map(({ key, label }) => (
              <label key={key} className="field-item">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(key)}
                  onChange={() => toggleField(key)}
                />{' '}
                {label}
              </label>
            ))}
          </div>
          <button
            className="btn blue"
            onClick={handleExport}
            disabled={selectedFields.length === 0}
          >
            Exportă Excel
          </button>
        </div>
      )}
    </div>
  )
}
