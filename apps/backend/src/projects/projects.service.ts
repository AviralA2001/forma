import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async createProject(orgId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {

    // TODO: Verify user has project admin access and add user_id as project creator
    const project = await this.projectsRepository.create(orgId, dto.name);
    return this.mapToResponse(project);
  }

  async getProjects(orgId: string,): Promise<ProjectResponseDto[]> {

    // TODO: Verify user has access to projects, will change the whole flow find the project ids from project users and then fetch those projects
    const projects = await this.projectsRepository.findAllByOwner(orgId);
    return projects.map(p => this.mapToResponse(p));
  }

  async getProject(projectId: string, orgId: string,): Promise<ProjectResponseDto> {

    // TODO: Verify user has access to the project
    const project = await this.projectsRepository.findOne(projectId, orgId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.mapToResponse(project);
  }

  async updateProject(
    projectId: string,
    orgId: string, 
    dto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {

    // TODO: Verify user has project admin access
    const project = await this.projectsRepository.findOne(projectId, orgId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated = await this.projectsRepository.update(
      projectId,
      orgId,
      dto.name || project.name
    );
    return this.mapToResponse(updated);
  }

  async deleteProject(projectId: string, orgId: string): Promise<void> {

    // TODO: Verify user has project admin access
    const project = await this.projectsRepository.findOne(projectId, orgId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status === 'published') {
      throw new BadRequestException('Published projects cannot be deleted');
    }

    await this.projectsRepository.delete(projectId, orgId);
  }

  private mapToResponse(project: any): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.project_id = project.project_id;
    dto.name = project.name;
    dto.org_id = project.org_id;
    dto.status = project.status;
    dto.created_at = project.created_at;
    dto.updated_at = project.updated_at;
    return dto;
  }
}
