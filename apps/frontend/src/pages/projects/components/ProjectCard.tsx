import React from 'react';
import { Project } from '@forma/shared';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
  onClick: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formattedDate = new Date(project.created_at).toLocaleDateString();

  return (
    <div className="project-card" onClick={() => onClick(project.project_id)}>
      <div className="project-card-header">
        <h3 className="project-card-title">{project.name}</h3>
        <span className={`project-status project-status-${project.status}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
      <p className="project-card-date">Created {formattedDate}</p>
    </div>
  );
};
