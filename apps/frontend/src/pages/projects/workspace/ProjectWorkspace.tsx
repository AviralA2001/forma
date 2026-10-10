import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Project } from '@forma/shared';
import { projectsApi } from '../../../api/projects';
import { TablesPage } from '../../tables';
import './ProjectWorkspace.css';

export const ProjectWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'tables' | 'master-table' | 'users' | 'audit'>('tables');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<'publish' | 'unpublish' | null>(null);

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.getProject(id!);
      setProject(data);
      setEditedName(data.name);
      setError(null);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadProject();
  }, [id, loadProject]);

  useEffect(() => {
    // Check if URL contains '/tables' and set active section accordingly
    if (location.pathname.includes('/tables')) {
      setActiveSection('tables');
    }
  }, [location.pathname]);

  const handleSaveName = async () => {
    if (!project || !editedName.trim()) {
      setEditedName(project?.name || '');
      setIsEditingName(false);
      return;
    }

    try {
      const updated = await projectsApi.updateProject(project.project_id, editedName);
      setProject(updated);
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      setEditedName(project?.name || '');
      setIsEditingName(false);
    }
  };

  const handleLifecycle = async (action: 'publish' | 'unpublish') => {
    if (!project) return;
    try {
      setActionPending(action);
      setActionError(null);
      await projectsApi.postProjectAction(project.project_id, action);
      await loadProject();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setActionError(message);
      console.error(err);
    } finally {
      setActionPending(null);
    }
  };

  if (isLoading) {
    return <div className="workspace"><p>Loading...</p></div>;
  }

  if (error || !project) {
    return (
      <div className="workspace">
        <p>{error || 'Project not found'}</p>
        <button onClick={() => navigate('/projects')}>Back to Projects</button>
      </div>
    );
  }

  return (
    <div className="workspace">
      <div className="workspace-header">
        <div className="workspace-header-left">
          <button 
            className="back-button" 
            onClick={() => navigate('/projects')}
            title="Back to Projects"
          >
            ← Projects
          </button>
          <div className="workspace-title">
            {isEditingName ? (
              <input
                type="text"
                className="workspace-title-input"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setEditedName(project.name);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <h1 className="workspace-title-text" onClick={() => setIsEditingName(true)}>
                {project.name}
              </h1>
            )}
          </div>
          <span className={`status-badge status-${project.status}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        {project.status !== 'closed' && (
          <div className="publish-action">
            <button
              className={`btn ${
                project.status === 'published'
                  ? 'btn-destructive'
                  : project.publish_conditions && project.publish_conditions.length > 0
                    ? 'btn-secondary'
                    : 'btn-primary'
              }`}
              disabled={
                actionPending !== null ||
                (project.status === 'draft' && !!project.publish_conditions && project.publish_conditions.length > 0)
              }
              onClick={() => handleLifecycle(project.status === 'published' ? 'unpublish' : 'publish')}
            >
              {actionPending === 'publish'
                ? 'Publishing...'
                : actionPending === 'unpublish'
                  ? 'Unpublishing...'
                  : project.status === 'published'
                    ? 'Unpublish'
                    : 'Publish'}
            </button>
            {project.status === 'draft' && project.publish_conditions && project.publish_conditions.length > 0 && (
              <div className="publish-tooltip" role="tooltip">
                {project.publish_conditions.map((condition) => (
                  <p key={condition}>{condition}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {actionError && <div className="error-banner">{actionError}</div>}

      <div className="workspace-breadcrumbs">
        <a href="/projects" className="breadcrumb-link">Projects</a>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">{project.name}</span>
      </div>

      <div className="workspace-container">
        <aside className="workspace-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`sidebar-nav-item ${activeSection === 'master-table' ? 'active' : ''}`}
              onClick={() => setActiveSection('master-table')}
            >
              Master Table
            </button>
            <button
              className={`sidebar-nav-item ${activeSection === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveSection('tables')}
            >
              Tables
            </button>
            <button
              className={`sidebar-nav-item ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              Users
            </button>
            <button
              className={`sidebar-nav-item ${activeSection === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveSection('audit')}
            >
              Audit
            </button>
          </nav>
        </aside>

        <main className="workspace-main">
          <div className={`workspace-section-${activeSection === 'tables' ? 'tables' : ''}`}>
            {activeSection === 'tables' && (
              <TablesPage project={project} />
            )}
            {activeSection === 'master-table' && (
              <div>
                <h2>Master Table</h2>
                <p>Master Table section — coming soon</p>
              </div>
            )}
            {activeSection === 'users' && (
              <div>
                <h2>Users</h2>
                <p>Users section — coming soon</p>
              </div>
            )}
            {activeSection === 'audit' && (
              <div>
                <h2>Audit</h2>
                <p>Audit section — coming soon</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
