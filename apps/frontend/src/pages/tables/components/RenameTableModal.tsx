import React, { useState, useEffect } from 'react';
import './RenameTableModal.css';

interface RenameTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
  isLoading?: boolean;
}

export const RenameTableModal: React.FC<RenameTableModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentName,
  isLoading = false,
}) => {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError('');
    }
  }, [isOpen, currentName]);

  const handleConfirm = () => {
    if (!newName.trim()) {
      setError('Table name cannot be empty');
      return;
    }
    onConfirm(newName);
    setError('');
  };

  const handleClose = () => {
    setNewName(currentName);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Rename Table</h2>
        <div className="modal-body">
          <div className="input-container">
            <label htmlFor="table-name">Table Name</label>
            <input
              id="table-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="modal-actions">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !newName.trim()}
            className="confirm-button"
          >
            {isLoading ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </div>
    </div>
  );
};