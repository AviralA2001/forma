import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@forma/shared';
import { projectsApi } from '../../api/projects';
import { ProjectCard } from './components/ProjectCard';
import { NewProjectModal } from './components/NewProjectModal';
import './ProjectsPage.css';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (name: string) => {
    try {
      setIsCreating(true);
      const newProject = await projectsApi.createProject(name);
      setProjects([newProject, ...projects]);
      setIsModalOpen(false);
      navigate(`/projects/${newProject.project_id}`);
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return <div className="projects-page"><p>Loading projects...</p></div>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <button
          className="projects-new-button"
          onClick={() => setIsModalOpen(true)}
        >
          + New Project
        </button>
      </div>

      {error && <div className="projects-error">{error}</div>}

      {projects.length === 0 ? (
        <div className="projects-empty">
          <h2>No projects yet</h2>
          <p>Create your first project to get started</p>
          <button
            className="projects-empty-button"
            onClick={() => setIsModalOpen(true)}
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <ProjectCard
              key={project.project_id}
              project={project}
              onClick={handleProjectClick}
            />
          ))}
        </div>
      )}

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreateProject}
        isLoading={isCreating}
      />
    </div>
  );
};
