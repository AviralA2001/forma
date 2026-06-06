import React from 'react';

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
        <div className="modal-header">
          <h2 className="modal-title">Delete Table</h2>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete the table "{tableName}"?</p>
          <p className="text-warning text-sm mb-md">This action cannot be undone.</p>
          {isReferenced && (
            <div className="error-message">
              This table is referenced in the master table and cannot be deleted.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || isReferenced}
            className="btn btn-destructive"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};