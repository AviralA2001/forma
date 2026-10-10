import { Project } from '@forma/shared';

const API_URL = 'http://localhost:3001';

export const projectsApi = {
  async createProject(name: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  async updateProject(id: string, name: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },

  async publishProject(id: string): Promise<Project> {
    return this.postProjectAction(id, 'publish');
  },

  async unpublishProject(id: string): Promise<Project> {
    return this.postProjectAction(id, 'unpublish');
  },

  async postProjectAction(id: string, action: 'publish' | 'unpublish'): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}/${action}`, { method: 'POST' });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const error = new Error(body.message || `Failed to ${action} project`) as Error & { conditions?: string[] };
      error.conditions = body.conditions;
      throw error;
    }
    return response.json();
  },
};
