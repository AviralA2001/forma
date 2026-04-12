import React, { useState } from 'react';
import './NewProjectModal.css';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!projectName.trim()) {
      setError('Project name cannot be empty');
      return;
    }
    onConfirm(projectName);
    setProjectName('');
    setError('');
  };

  const handleClose = () => {
    setProjectName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Create a new project</h2>
        <input
          type="text"
          className={`modal-input ${error ? 'modal-input-error' : ''}`}
          placeholder="Project name"
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleClose();
          }}
          disabled={isLoading}
          autoFocus
        />
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button
            className="modal-button modal-button-ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="modal-button modal-button-primary"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};
