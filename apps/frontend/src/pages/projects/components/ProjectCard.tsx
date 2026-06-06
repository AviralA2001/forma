import React from 'react';
import { Project } from '@forma/shared';

interface ProjectCardProps {
  project: Project;
  onClick: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formattedDate = new Date(project.created_at).toLocaleDateString();

  return (
    <div className="card" onClick={() => onClick(project.project_id)}>
      <div className="card-header">
        <h3 className="card-title">{project.name}</h3>
        <span className={`status-badge status-${project.status}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
      <p className="card-subtitle">Created {formattedDate}</p>
    </div>
  );
};
