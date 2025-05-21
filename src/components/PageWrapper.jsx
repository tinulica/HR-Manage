// src/components/PageWrapper.jsx
import Sidebar from './Sidebar'
import Header from './Header'

export default function PageWrapper({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">{children}</main>
      </div>
    </div>
  )
}
