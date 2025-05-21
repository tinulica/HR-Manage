import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts'
import './Dashboard.css'

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: session } = await supabase.auth.getSession()
        const userId = session?.session?.user?.id
        if (!userId) throw new Error('Utilizator invalid.')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .single()
        if (profileError || !profile?.organization_id) throw new Error('Organizație inexistentă.')
        const { data: entryData, error: entryError } = await supabase
          .from('entries')
          .select('id, created_at, platform, full_name, salariu_total')
          .eq('organization_id', profile.organization_id)
        if (entryError) throw new Error('Eroare la încărcarea datelor.')
        setEntries(entryData || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="dashboard-container">Se încarcă...</div>
  if (error) return <div className="dashboard-container text-red-600">{error}</div>

  // Statistici
  const totalEntries = entries.length
  const salaryEntries = entries.filter(e => typeof e.salariu_total === 'number')
  const averageSalary = salaryEntries.length
    ? Math.round(
        salaryEntries.reduce((sum, e) => sum + e.salariu_total, 0) / salaryEntries.length
      )
    : 0

  const platformCounts = entries.reduce((acc, e) => {
    acc[e.platform] = (acc[e.platform] || 0) + 1
    return acc
  }, {})
  const platformData = Object.entries(platformCounts).map(([name, value]) => ({ name, value }))

  const salaryByMonth = entries.reduce((acc, e) => {
    const d = new Date(e.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    acc[key] = (acc[key] || 0) + (e.salariu_total || 0)
    return acc
  }, {})
  const salaryTrend = Object.entries(salaryByMonth)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total }))

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">Dashboard</div>

      <div className="info-cards">
        <div className="card">
          <h3>Total angajați</h3>
          <p>{totalEntries}</p>
        </div>
        <div className="card">
          <h3>Salariu mediu</h3>
          <p>{averageSalary} RON</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Distribuție Platformă</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie dataKey="value" data={platformData} label />
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Trend Salarii</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salaryTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="total" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-600">Nu există încă entries.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Platformă</th>
                <th>Nume</th>
                <th>Prenume</th>
                <th>Dată</th>
                <th>Salariu total</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const [nume, ...prenumeParts] = entry.full_name?.split(' ') || ['', '']
                const prenume = prenumeParts.join(' ')
                return (
                  <tr key={entry.id}>
                    <td>{entry.platform}</td>
                    <td>{nume}</td>
                    <td>{prenume}</td>
                    <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                    <td>{entry.salariu_total ?? '—'} RON</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
