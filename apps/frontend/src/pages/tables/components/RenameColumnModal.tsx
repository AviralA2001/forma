import React, { useState, useEffect } from 'react';

interface RenameColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
  isLoading?: boolean;
}

export const RenameColumnModal: React.FC<RenameColumnModalProps> = ({
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
      setError('Column name cannot be empty');
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
        <div className="modal-header">
          <h2 className="modal-title">Rename Column</h2>
        </div>
        <div className="modal-body">
          <div className="input-group">
            <label htmlFor="column-name" className="input-label">Column Name</label>
            <input
              id="column-name"
              type="text"
              className="input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="modal-footer">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !newName.trim()}
            className="btn btn-primary"
          >
            {isLoading ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </div>
    </div>
  );
};