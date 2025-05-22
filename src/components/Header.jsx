// src/components/Header.jsx
import { Link }            from 'react-router-dom';
import { Home }            from 'lucide-react';
import { UserButton }      from '@clerk/clerk-react';
import './Header.css';

export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/dashboard" className="topbar-logo">
          <Home size={20} /> HR Manage
        </Link>
      </div>

      <div className="topbar-right">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: 'w-8 h-8 rounded-full',
              userButtonTriggerIcon: 'hidden'
            }
          }}
        />
      </div>
    </header>
  );
}
