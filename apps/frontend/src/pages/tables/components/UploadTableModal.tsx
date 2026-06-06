import React, { useState, useRef } from 'react';

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
        <div className="modal-header">
          <h2 className="modal-title">Upload CSV Table</h2>
        </div>
        <div className="modal-body">
          <div className="input-group">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="input"
            />
            {selectedFile && (
              <div className="text-sm text-success">
                Selected: {selectedFile.name}
              </div>
            )}
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
            disabled={isLoading || !selectedFile}
            className="btn btn-primary"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};