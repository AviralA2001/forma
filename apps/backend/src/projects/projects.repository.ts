import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class ProjectsRepository {
  private readonly repository: Repository<Project>;

  constructor(private readonly connection: Connection) {
    this.repository = this.connection.getRepository(Project);
  }

  async create(ownerId: string, name: string): Promise<Project> {
    const project = this.repository.create({
      project_id: uuidv4(),
      owner_id: ownerId,
      name,
      status: 'draft',
    });
    return this.repository.save(project);
  }

  async findAllByOwner(ownerId: string): Promise<Project[]> {
    return this.repository.find({
      where: { owner_id: ownerId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(projectId: string, ownerId: string): Promise<Project | null> {
    return this.repository.findOne({
      where: { project_id: projectId, owner_id: ownerId },
    });
  }

  async update(projectId: string, ownerId: string, name: string): Promise<Project> {
    await this.repository.update(
      { project_id: projectId, owner_id: ownerId },
      { name }
    );
    return this.findOne(projectId, ownerId);
  }

  async delete(projectId: string, ownerId: string): Promise<void> {
    await this.repository.delete({
      project_id: projectId,
      owner_id: ownerId,
    });
  }
}
