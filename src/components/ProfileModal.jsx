import { useState, useContext } from "react";
import {
  useUser,
  useOrganization,
  useAuth
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import InviteEmployeeModal from "./InviteEmployeeModal";
import { SupabaseContext } from "../App";
import "./ProfileModal.css";

export default function ProfileModal({ onClose }) {
  const { user, isLoaded: userLoaded }         = useUser();
  const { organization, isLoaded: orgLoaded }  = useOrganization();
  const { signOut }                            = useAuth();
  const supabase                               = useContext(SupabaseContext);
  const navigate                               = useNavigate();

  const [showInvite, setShowInvite] = useState(false);
  const [uploading, setUploading]   = useState(false);

  if (!userLoaded || !orgLoaded) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await user.setProfileImage({ file });
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Contul meu</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </header>

        <section className="modal-section">
          <label htmlFor="avatar-upload" className="avatar-label">
            <img
              src={user.profileImageUrl}
              alt="Avatar"
              className={`profile-avatar${uploading ? " loading" : ""}`}
            />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="avatar-input"
            />
          </label>
          <p><strong>Nume:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.primaryEmailAddress.emailAddress}</p>
        </section>

        <section className="modal-section">
          <h3>Organizație</h3>
          <p>{organization?.name || "–"}</p>
          <button
            className="btn blue"
            onClick={() => setShowInvite(true)}
            disabled={!organization}
          >
            Invită angajat
          </button>
        </section>

        <section className="modal-section">
          <button className="btn red" onClick={handleSignOut}>
            Deconectează-te
          </button>
        </section>

        {showInvite && organization && (
          <InviteEmployeeModal
            clerkOrgId={organization.id}
            onClose={() => setShowInvite(false)}
          />
        )}
      </div>
    </div>
  );
}
