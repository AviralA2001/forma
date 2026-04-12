import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async createProject(ownerId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.create(ownerId, dto.name);
    return this.mapToResponse(project);
  }

  async getProjects(ownerId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsRepository.findAllByOwner(ownerId);
    return projects.map(p => this.mapToResponse(p));
  }

  async getProject(projectId: string, ownerId: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne(projectId, ownerId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.mapToResponse(project);
  }

  async updateProject(
    projectId: string,
    ownerId: string,
    dto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne(projectId, ownerId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated = await this.projectsRepository.update(
      projectId,
      ownerId,
      dto.name || project.name
    );
    return this.mapToResponse(updated);
  }

  async deleteProject(projectId: string, ownerId: string): Promise<void> {
    const project = await this.projectsRepository.findOne(projectId, ownerId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status === 'published') {
      throw new BadRequestException('Published projects cannot be deleted');
    }

    await this.projectsRepository.delete(projectId, ownerId);
  }

  private mapToResponse(project: any): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.project_id = project.project_id;
    dto.name = project.name;
    dto.owner_id = project.owner_id;
    dto.status = project.status;
    dto.created_at = project.created_at;
    dto.updated_at = project.updated_at;
    return dto;
  }
}
