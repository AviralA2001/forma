import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TableResponse, TableDetailResponse, tablesApi } from '../../api/tables';
import { projectsApi } from '../../api/projects';
import { Project } from '@forma/shared';
import { TableDetail } from './components/TableDetail';
import { UploadTableModal } from './components/UploadTableModal';
import { RenameTableModal } from './components/RenameTableModal';
import { RenameColumnModal } from './components/RenameColumnModal';
import { DeleteTableModal } from './components/DeleteTableModal';
import './TablesPage.css';

interface TablesPageProps {
  project?: Project;
}

export const TablesPage: React.FC<TablesPageProps> = ({ project: propProject }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(propProject || null);
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDetailResponse | null>(null);
  const [isReupload, setIsReupload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRenameTableModalOpen, setIsRenameTableModalOpen] = useState(false);
  const [isRenameColumnModalOpen, setIsRenameColumnModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Modal data
  const [uploadingTable, setUploadingTable] = useState(false);
  const [renamingTable, setRenamingTable] = useState(false);
  const [renamingColumn, setRenamingColumn] = useState(false);
  const [deletingTable, setDeletingTable] = useState(false);
  const [currentTableId, setCurrentTableId] = useState<string>('');
  const [currentTableName, setCurrentTableName] = useState<string>('');
  const [currentColumnId, setCurrentColumnId] = useState<string>('');
  const [currentColumnName, setCurrentColumnName] = useState<string>('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (propProject) {
      setProject(propProject);
      return;
    }
    if (!projectId) return;
    try {
      const projectData = await projectsApi.getProject(projectId);
      setProject(projectData);
    } catch (err) {
      console.error('Failed to load project:', err);
      navigate('/projects');
    }
  }, [projectId, navigate, propProject]);

  const getCurrentProjectId = useCallback(() => projectId || project?.project_id, [projectId, project?.project_id]);

  const loadTables = useCallback(async () => {
    const currentProjectId = getCurrentProjectId();
    if (!currentProjectId) return;

    try {
      setIsLoading(true);
      const data = await tablesApi.getTables(currentProjectId);
      setTables(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tables');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentProjectId]);

  useEffect(() => {
    loadProject();
    if (projectId || project?.project_id) {
      loadTables();
    }
  }, [projectId, project?.project_id, loadProject, loadTables]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleTableClick = useCallback(async (tableId: string) => {
    try {
      const tableData = await tablesApi.getTableDetail(getCurrentProjectId()!, tableId);
      setSelectedTable(tableData);
    } catch (err) {
      setError('Failed to load table details');
      console.error(err);
    }
  }, [getCurrentProjectId]);

  // Auto-select first table when tables are loaded
  useEffect(() => {
    if (tables.length > 0 && !selectedTable) {
      handleTableClick(tables[0].table_id);
    }
  }, [tables, selectedTable, handleTableClick]);

  const handleUploadTable = async (file: File) => {
    try {
      setUploadingTable(true);
      const newTable = await tablesApi.uploadTable(getCurrentProjectId()!, file);
      setTables([newTable, ...tables]);
      setIsUploadModalOpen(false);
    } catch (err) {
      setError('Failed to upload table');
      console.error(err);
    } finally {
      setUploadingTable(false);
    }
  };

  const handleRenameTable = async (newName: string) => {
    try {
      setRenamingTable(true);
      await tablesApi.renameTable(getCurrentProjectId()!, currentTableId, newName);

      // Update the table in the list
      setTables(tables.map(table =>
        table.table_id === currentTableId
          ? { ...table, name: newName }
          : table
      ));

      // Update selected table if it's the current one
      if (selectedTable && selectedTable.table_id === currentTableId) {
        setSelectedTable({ ...selectedTable, name: newName });
      }

      setIsRenameTableModalOpen(false);
    } catch (err) {
      setError('Failed to rename table');
      console.error(err);
    } finally {
      setRenamingTable(false);
    }
  };

  const handleRenameColumn = async (newName: string) => {
    try {
      setRenamingColumn(true);
      const updatedTable = await tablesApi.renameColumn(getCurrentProjectId()!, currentTableId, currentColumnId, newName);

      // Update selected table
      setSelectedTable(updatedTable);

      setIsRenameColumnModalOpen(false);
    } catch (err) {
      setError('Failed to rename column');
      console.error(err);
    } finally {
      setRenamingColumn(false);
    }
  };

  const handleDeleteTable = async () => {
    try {
      setDeletingTable(true);
      await tablesApi.deleteTable(getCurrentProjectId()!, currentTableId);

      // Remove from tables list
      setTables(tables.filter(table => table.table_id !== currentTableId));

      // If the deleted table was selected, go back to list
      if (selectedTable && selectedTable.table_id === currentTableId) {
        setSelectedTable(null);
      }

      setIsDeleteModalOpen(false);
    } catch (err) {
      setError('Failed to delete table');
      console.error(err);
    } finally {
      setDeletingTable(false);
    }
  };

  const handleReuploadTable = async (file: File) => {
    try {
      setUploadingTable(true);
      const updatedTable = await tablesApi.reuploadTable(getCurrentProjectId()!, currentTableId, file);

      // Update the table in the list
      setTables(tables.map(table =>
        table.table_id === currentTableId
          ? {
              ...table,
              column_count: updatedTable.columns.length,
              row_count: updatedTable.rows.length
            }
          : table
      ));

      // Update selected table
      setSelectedTable(updatedTable);

      setIsUploadModalOpen(false);
    } catch (err) {
      setError('Failed to reupload table');
      console.error(err);
    } finally {
      setUploadingTable(false);
    }
  };

  // Modal handlers
  const openRenameTableModal = (tableId: string, tableName: string) => {
    setCurrentTableId(tableId);
    setCurrentTableName(tableName);
    setIsRenameTableModalOpen(true);
  };

  const openRenameColumnModal = (columnId: string, columnName: string) => {
    setCurrentTableId(selectedTable!.table_id);
    setCurrentColumnId(columnId);
    setCurrentColumnName(columnName);
    setIsRenameColumnModalOpen(true);
  };

  const openDeleteModal = (tableId: string, tableName: string) => {
    setCurrentTableId(tableId);
    setCurrentTableName(tableName);
    setIsDeleteModalOpen(true);
  };

  const openReuploadModal = (tableId: string) => {
    setIsReupload(true);
    setCurrentTableId(tableId);
    setIsUploadModalOpen(true);
  };

  if (!projectId && !propProject) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  const isInWorkspace = !!propProject;

  return (
    <div className={`tables-page ${isInWorkspace ? 'workspace-mode' : ''}`}>
      {!isInWorkspace && (
        <>
          <div className="page-header">
            <div className="header-content">
              <button
                className="back-button"
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                ← {project.name}
              </button>
              <h1 className="page-title">Tables</h1>
            </div>
            <button
              className="upload-button"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload CSV
            </button>
          </div>

          <div className="breadcrumbs">
            <a href="/projects" className="breadcrumb-link">Projects</a>
            <span className="breadcrumb-separator">&gt;</span>
            <a href={`/projects/${projectId}`} className="breadcrumb-link">{project.name}</a>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-current">Tables</span>
          </div>
        </>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="page-content">
        {isLoading ? (
          <div className="loading-state">Loading tables...</div>
        ) : tables.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>No tables yet</h2>
              <p>Upload your first CSV file to get started with reference data.</p>
              <button
                className="upload-button-primary"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="tables-content">
            {/* Tabs */}
            <div className="tabs-container">
              <div className="tabs-list">
                {tables.map((table) => (
                  <div
                    key={table.table_id}
                    className={`tab ${selectedTable?.table_id === table.table_id ? 'active' : ''}`}
                  >
                    <button
                      className="tab-button"
                      onClick={() => handleTableClick(table.table_id)}
                    >
                      {table.name}
                    </button>
                    <div className="tab-menu">
                      <button
                        className="tab-menu-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === table.table_id ? null : table.table_id);
                        }}
                      >
                        ⋮
                      </button>
                      {openDropdownId === table.table_id && (
                        <div className="tab-dropdown">
                          <button
                            onClick={() => {
                              openRenameTableModal(table.table_id, table.name);
                              setOpenDropdownId(null);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => {
                              openReuploadModal(table.table_id);
                              setOpenDropdownId(null);
                            }}
                          >
                            Reupload
                          </button>
                          <button
                            onClick={() => {
                              openDeleteModal(table.table_id, table.name);
                              setOpenDropdownId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  className="add-tab-button"
                  onClick={() => {
                    setIsUploadModalOpen(true);
                    setIsReupload(false);
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Table Content */}
            {selectedTable && (
              <div className="table-view">
                <TableDetail
                  tableData={selectedTable}
                  onRenameTable={(currentName) => openRenameTableModal(selectedTable.table_id, currentName)}
                  onRenameColumn={openRenameColumnModal}
                  onDeleteTable={() => openDeleteModal(selectedTable.table_id, selectedTable.name)}
                  onReuploadTable={() => openReuploadModal(selectedTable.table_id)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadTableModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirm={isReupload ? handleReuploadTable : handleUploadTable}
        isLoading={uploadingTable}
      />

      <RenameTableModal
        isOpen={isRenameTableModalOpen}
        onClose={() => setIsRenameTableModalOpen(false)}
        onConfirm={handleRenameTable}
        currentName={currentTableName}
        isLoading={renamingTable}
      />

      <RenameColumnModal
        isOpen={isRenameColumnModalOpen}
        onClose={() => setIsRenameColumnModalOpen(false)}
        onConfirm={handleRenameColumn}
        currentName={currentColumnName}
        isLoading={renamingColumn}
      />

      <DeleteTableModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTable}
        tableName={currentTableName}
        isReferenced={false} // TODO: Check if table is referenced in master table
        isLoading={deletingTable}
      />
    </div>
  );
};