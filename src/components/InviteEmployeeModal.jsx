import { useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { SupabaseContext } from "../App";
import "./InviteEmployeeModal.css";

export default function InviteEmployeeModal({ clerkOrgId, onClose }) {
  const supabase = useContext(SupabaseContext);
  const { user } = useUser();

  const [email, setEmail]           = useState("");
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);
  const [loading, setLoading]       = useState(false);

  // New state for checking admin privileges
  const [isAdmin, setIsAdmin]       = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // 1) On mount, verify that the current user is an "admin" of this org
  useEffect(() => {
    if (!user || !clerkOrgId) return;

    const checkAdmin = async () => {
      setCheckingAdmin(true);

      const { data, error: fetchError } = await supabase
        .from("organization_memberships")
        .select("role")
        .eq("organization_id", clerkOrgId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !data) {
        console.error("Error fetching membership:", fetchError);
        setIsAdmin(false);
      } else {
        setIsAdmin(data.role === "admin");
      }

      setCheckingAdmin(false);
    };

    checkAdmin();
  }, [supabase, user, clerkOrgId]);

  const handleInvite = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await supabase.functions.invoke("invite-employee", {
        body: JSON.stringify({ email, clerkOrgId }),
      });

      if (res.error) {
        throw res.error;
      }

      setSuccess(true);
    } catch (err) {
      console.error("❌ Invite failed:", err);
      setError(err.message || "Invitație eșuată");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>Invită angajat</h2>

        {checkingAdmin ? (
          <p>Se verifică permisiuni…</p>
        ) : !isAdmin ? (
          <>
            <p className="error">
              Nu ai permisiunea de administrator pentru a invita membri.
            </p>
            <button onClick={onClose} className="close-btn">
              Închide
            </button>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email angajat"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading || success}
            />

            <button
              onClick={handleInvite}
              disabled={loading || success || !email}
            >
              {loading
                ? "Se trimit invitația…"
                : success
                ? "Trimis ✓"
                : "Trimite invitație"}
            </button>

            {success && <p className="success">Invitație trimisă cu succes!</p>}
            {error && <p className="error">Eroare: {error}</p>}

            <button onClick={onClose} className="close-btn">
              Închide
            </button>
          </>
        )}
      </div>
    </div>
  );
}
