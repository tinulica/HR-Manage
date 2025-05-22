// src/components/Sidebar.jsx
import { Home, Users, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import path from 'path';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard',  path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Entries',    path: '/entries',   icon: <Users size={18} /> },
    { name: 'Statistici', path: '/analytics', icon: <BarChart3 size={18} /> },
    { name: 'Invitations', path: '/invitations', icon: <Users size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu-area">
        <ul className="sidebar-menu">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={
                  `sidebar-link${location.pathname === item.path ? ' active' : ''}`
                }
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
