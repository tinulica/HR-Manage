// unchanged imports
import { useState } from "react";
import {
  useOrganizationList,
  useClerk,
  useUser,
} from "@clerk/clerk-react";
import "./InvitationsPage.css";

export default function InvitationsPage() {
  const {
    organization: activeOrg,
    userInvitations,
    userMemberships,
    isLoaded: listLoaded,
  } = useOrganizationList({
    userInvitations: { status: ["pending", "accepted", "revoked"] },
    userMemberships: true,
  });

  const { user } = useUser();
  const clerk = useClerk();

  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("basic_member");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);

  if (!listLoaded) return <p>Se încarcă datele…</p>;

  const handleInvite = async () => {
    setError("");
    setInviteSuccess(false);
    setLoadingInvite(true);

    if (!activeOrg?.id) {
      setError("Nu ești într-o organizație activă.");
      setLoadingInvite(false);
      return;
    }

    try {
      const res = await fetch("/functions/v1/invite-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await clerk.session.getToken()}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          organization_id: activeOrg.id,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invitația a eșuat");

      setInviteSuccess(true);
      setInviteEmail("");
      setInviteRole("basic_member");
      await userInvitations.fetchNext({ keepPreviousData: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleRevoke = async (inv) => {
    setError("");
    setBusyId(inv.id);
    try {
      await clerk.organizations.revokeOrganizationInvitation({
        organizationId: activeOrg.id,
        invitationId: inv.id,
        requestingUserId: user.id,
      });
      await userInvitations.fetchNext({ keepPreviousData: false });
    } catch (err) {
      setError(err.message || "Nu s-a putut revoca invitația");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (mem) => {
    setError("");
    setBusyId(mem.id);
    try {
      await mem.destroy();
      await userMemberships.fetchNext({ keepPreviousData: false });
    } catch (err) {
      setError(err.message || "Nu s-a putut elimina membrul");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="invitations-page">
      <h1>Administrare Invitări și Membri</h1>
      {error && <p className="error">{error}</p>}

      {/* Invite Form */}
      <section className="invite-form">
        <h2>Trimite Invitație Nouă</h2>
        <div className="invite-controls">
          <input
            type="email"
            placeholder="Email utilizator"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={loadingInvite}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            disabled={loadingInvite}
          >
            <option value="basic_member">Membru</option>
            <option value="admin">Administrator</option>
          </select>
          <button
            className="btn primary"
            onClick={handleInvite}
            disabled={loadingInvite || !inviteEmail}
          >
            {loadingInvite ? "Se trimite…" : "Trimite"}
          </button>
        </div>
        {inviteSuccess && (
          <p className="success">Invitația a fost trimisă cu succes!</p>
        )}
      </section>

      {/* Member Table */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Membri Înregistrați</h2>
        <table className="invitations-table">
          <thead>
            <tr>
              <th></th>
              <th>Email</th>
              <th>Nume Utilizator</th>
              <th>Rol</th>
              <th>Dată Aderare</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {userMemberships.data.length === 0 ? (
              <tr>
                <td colSpan="6">Nu există membri.</td>
              </tr>
            ) : (
              userMemberships.data.map((mem) => {
                const email =
                  mem.publicUserData.primaryEmailAddress?.emailAddress;
                const profileLink = `https://clerk.dev?email=${encodeURIComponent(
                  email ?? ""
                )}`;

                return (
                  <tr key={mem.id}>
                    <td>
                      <a href={profileLink} target="_blank" rel="noreferrer">
                        <img
                          src={mem.publicUserData.imageUrl}
                          alt="avatar"
                          className="avatar"
                        />
                      </a>
                    </td>
                    <td>
                      <a href={profileLink} target="_blank" rel="noreferrer">
                        {email ?? "–"}
                      </a>
                    </td>
                    <td>
                      <a href={profileLink} target="_blank" rel="noreferrer">
                        {mem.publicUserData.username ??
                          mem.publicUserData.identifier ??
                          "–"}
                      </a>
                    </td>
                    <td>{mem.role}</td>
                    <td>{formatDate(mem.createdAt)}</td>
                    <td>
                      <button
                        className="btn red small"
                        onClick={() => handleRemove(mem)}
                        disabled={busyId === mem.id}
                      >
                        {busyId === mem.id ? "Se șterge…" : "Șterge"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// Helpers
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
