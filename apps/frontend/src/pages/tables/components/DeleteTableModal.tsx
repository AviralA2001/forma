import React from 'react';
import './DeleteTableModal.css';

interface DeleteTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableName: string;
  isReferenced: boolean;
  isLoading?: boolean;
}

export const DeleteTableModal: React.FC<DeleteTableModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tableName,
  isReferenced,
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Table</h2>
        <div className="modal-body">
          <p>Are you sure you want to delete the table "{tableName}"?</p>
          <p className="warning-text">This action cannot be undone.</p>
          {isReferenced && (
            <div className="error-message">
              This table is referenced in the master table and cannot be deleted.
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || isReferenced}
            className="delete-button"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};