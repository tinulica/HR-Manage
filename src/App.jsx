import { useEffect, useState } from 'react';
import { useAuth, useOrganizationList } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createSupabaseClient } from './supabaseClient';

import SupabaseContext from './contexts/SupabaseContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EntriesPage from './pages/EntriesPage';
import Dashboard from './pages/Dashboard';
import InvitationsPage from './pages/InvitationsPage';
import CreateOrganizationPage from './pages/CreateOrganizationPage';

// ✅ Only show the full app if the user is in an organization
function ProtectedAppLayout() {
  const { userMemberships, isLoaded } = useOrganizationList();

  if (!isLoaded) {
    return <p className="p-4">Se încarcă datele organizației…</p>;
  }

  if (userMemberships.length === 0) {
    return <CreateOrganizationPage />;
  }

  return (
    <>
      <Sidebar />
      <Header />
      <main style={{
        marginLeft: '240px',
        marginTop: '64px',
        padding: '2rem',
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
      }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="*" element={<Navigate to="/entries" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState(() => createSupabaseClient());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getToken({ template: 'supabase' })
      .then(token => {
        setSupabase(createSupabaseClient(token));
      })
      .catch(err => console.error('Error creating Supabase client:', err))
      .finally(() => setReady(true));
  }, [getToken]);

  if (!ready) {
    return <p className="p-4">Se încarcă aplicația…</p>;
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      <ProtectedAppLayout />
    </SupabaseContext.Provider>
  );
}
