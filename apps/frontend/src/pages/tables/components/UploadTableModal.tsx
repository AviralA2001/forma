import React, { useState, useRef } from 'react';
import './UploadTableModal.css';

interface UploadTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  isLoading?: boolean;
}

export const UploadTableModal: React.FC<UploadTableModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Only CSV files are supported');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }
    onConfirm(selectedFile);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload CSV Table</h2>
        <div className="modal-body">
          <div className="file-input-container">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isLoading}
            />
            {selectedFile && (
              <div className="file-info">
                Selected: {selectedFile.name}
              </div>
            )}
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
            disabled={isLoading || !selectedFile}
            className="confirm-button"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};