// src/App.jsx
import { useEffect, useState, createContext } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createSupabaseClient } from './supabaseClient';

import Sidebar     from './components/Sidebar';
import Header      from './components/Header';
import EntriesPage from './pages/EntriesPage';
import Dashboard   from './pages/Dashboard';
import InvitationsPage from './pages/InvitationsPage';

// Expose your Supabase client via React Context
export const SupabaseContext = createContext(null);

function AppLayout() {
  return (
    <>
      <Sidebar />
      <Header />
      <main style={{
        marginLeft: '240px',
        marginTop:  '64px',
        padding:    '2rem',
        backgroundColor: '#f9fafb',
        minHeight:  '100vh'
      }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entries"   element={<EntriesPage />} />
          <Route path="*"          element={<Navigate to="/entries" />} />
          <Route path="/invitations" element={<InvitationsPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState(() => createSupabaseClient());
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    // Grab the Clerk→Supabase JWT and rebuild the client with it
    getToken({ template: 'supabase' })
      .then(token => {
        setSupabase(createSupabaseClient(token));
      })
      .catch(err => console.error('Error creating Supabase client:', err))
      .finally(() => setReady(true));
  }, [getToken]);

  if (!ready) {
    return <p className="p-4">Se încarcă...</p>;
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      <AppLayout />
    </SupabaseContext.Provider>
  );
}
