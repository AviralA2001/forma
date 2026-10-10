import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsRepository {
  private readonly repository: Repository<Project>;

  constructor(private readonly connection: Connection) {
    this.repository = this.connection.getRepository(Project);
  }

  async create(orgId: string, name: string): Promise<Project> {
    const project = this.repository.create({
      org_id: orgId,
      name,
      status: 'draft',
    });
    return this.repository.save(project);
  }

  async findAllByOwner(orgId: string): Promise<Project[]> {
    return this.repository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(projectId: string, orgId: string): Promise<Project | null> {
    return this.repository.findOne({
      where: { project_id: projectId, org_id: orgId },
    });
  }

  async update(projectId: string, orgId: string, name: string): Promise<Project> {
    await this.repository.update(
      { project_id: projectId, org_id: orgId },
      { name }
    );
    return this.findOne(projectId, orgId);
  }

  async updateStatus(
    projectId: string,
    orgId: string,
    status: Project['status']
  ): Promise<Project> {
    await this.repository.update({ project_id: projectId, org_id: orgId }, { status });
    return this.findOne(projectId, orgId);
  }

  async delete(projectId: string, orgId: string): Promise<void> {
    await this.repository.delete({
      project_id: projectId,
      org_id: orgId,
    });
  }
}
