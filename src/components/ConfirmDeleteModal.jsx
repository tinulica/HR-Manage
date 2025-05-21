// src/components/ConfirmDeleteModal.jsx
export default function ConfirmDeleteModal({ entry, onConfirm, onCancel }) {
  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal confirm-delete-modal">
        <div className="custom-modal-header">
          <h4>Confirmare ștergere</h4>
        </div>
        <div className="custom-modal-body">
          <p>
            Ești sigur că vrei să ștergi <strong>{entry.full_name}</strong>? Această acțiune este ireversibilă.
          </p>
        </div>
        <div className="custom-modal-footer">
          <button className="custom-btn cancel" onClick={onCancel}>
            Anulează
          </button>
          <button className="custom-btn danger" onClick={onConfirm}>
            Confirmă ștergerea
          </button>
        </div>
      </div>
    </div>
  )
}