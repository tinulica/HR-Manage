// src/layouts/DashboardLayout.jsx
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
