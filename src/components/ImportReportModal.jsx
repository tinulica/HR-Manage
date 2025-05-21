// src/components/ImportReportModal.jsx
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../supabaseClient'

export default function ImportReportModal({ onClose, onImported }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setStatus('')
  }

  const parseAndImport = async () => {
    if (!file) return

    setStatus('Se procesează fișierul...')
    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      const parsed = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row[1]) continue
        parsed.push({
          full_name: row[1],
          platform: 'glovo',
          week_label: row[2],
          gross_income: parseFloat(row[3]) || 0,
          tips: parseFloat(row[4]) || 0,
          app_fee: parseFloat(row[5]) || 0,
          net_income: parseFloat(row[6]) || 0
        })
      }

      // Caută entry_id pe baza numelui
      const { data: entries } = await supabase.from('entries').select('id, full_name')

      const inserts = parsed
        .map((p) => {
          const match = entries.find((e) => e.full_name?.trim().toLowerCase() === p.full_name.trim().toLowerCase())
          if (!match) return null
          return { ...p, entry_id: match.id }
        })
        .filter(Boolean)

      const { error } = await supabase.from('salaries').insert(inserts)
      if (error) {
        setStatus('Eroare la import: ' + error.message)
      } else {
        setStatus('Import reușit!')
        onImported()
        onClose()
      }
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Importă raport Glovo</h2>
        <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="mb-4" />
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Anulează
          </button>
          <button
            onClick={parseAndImport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Importă
          </button>
        </div>
        {status && <p className="mt-4 text-sm text-center">{status}</p>}
      </div>
    </div>
  )
}
