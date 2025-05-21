import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function SalaryReport({ entryId }) {
  const [report, setReport] = useState([])

  useEffect(() => {
    const loadReport = async () => {
      const { data, error } = await supabase
        .from('entry_salary_report')
        .select('*')
        .eq('entry_id', entryId)
        .order('report_date', { ascending: true })

      if (error) console.error('Eroare raport salarii:', error)
      else setReport(data)
    }
    if (entryId) loadReport()
  }, [entryId])

  if (!report.length) return <p>Nu există date de salarizare.</p>

  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th>Data Raport</th>
          <th>Sumă Brută</th>
          <th>Sumă Netă</th>
          <th>Ore</th>
        </tr>
      </thead>
      <tbody>
        {report.map(r => (
          <tr key={r.raw_id}>
            <td>{new Date(r.report_date).toLocaleDateString()}</td>
            <td>{r.gross_amount.toFixed(2)} RON</td>
            <td>{r.net_amount.toFixed(2)} RON</td>
            <td>{r.hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
