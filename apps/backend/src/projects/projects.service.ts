import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { Project } from './entities/project.entity';
import { asArray, masterTableReferences, unmetPublishConditions } from './publish-conditions';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly connection: Connection
  ) {}

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
    return this.mapToResponse(project, await this.publishConditions(projectId));
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

  async publishProject(projectId: string, orgId: string): Promise<ProjectResponseDto> {
    const project = await this.requireProject(projectId, orgId);
    if (project.status !== 'draft') {
      throw new BadRequestException('Only a draft project can be published');
    }
    const conditions = await this.publishConditions(projectId);
    if (conditions.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Publish conditions are not met',
        conditions,
      });
    }
    const updated = await this.projectsRepository.updateStatus(projectId, orgId, 'published');
    return this.mapToResponse(updated, []);
  }

  async unpublishProject(projectId: string, orgId: string): Promise<ProjectResponseDto> {
    const project = await this.requireProject(projectId, orgId);
    if (project.status !== 'published') {
      throw new BadRequestException('Only a published project can be unpublished');
    }
    await this.inactivateRowAccess(projectId);
    const updated = await this.projectsRepository.updateStatus(projectId, orgId, 'draft');
    return this.mapToResponse(updated, await this.publishConditions(projectId));
  }

  async closeProject(projectId: string, orgId: string): Promise<ProjectResponseDto> {
    const project = await this.requireProject(projectId, orgId);
    if (project.status === 'closed') {
      throw new BadRequestException('Project is already closed');
    }
    await this.inactivateRowAccess(projectId);
    const updated = await this.projectsRepository.updateStatus(projectId, orgId, 'closed');
    return this.mapToResponse(updated, []);
  }

  private async requireProject(projectId: string, orgId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne(projectId, orgId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  private async publishConditions(projectId: string): Promise<string[]> {
    const tableCount = await this.scalarCount(
      `SELECT COUNT(*)::int AS count FROM tables WHERE project_id = $1 AND status = 'active'`,
      [projectId],
      'tables'
    );
    const master = await this.masterTable(projectId);
    const userCount = await this.scalarCount(
      `SELECT COUNT(*)::int AS count FROM project_users WHERE project_id = $1 AND role = 'project_user' AND status = 'active'`,
      [projectId],
      'project_users'
    );
    return unmetPublishConditions({
      tableCount: tableCount ?? 0,
      columns: master ? asArray(master.columns) : null,
      userCount: userCount ?? 0,
    });
  }

  private async masterTable(projectId: string): Promise<{ columns: unknown; joins: unknown } | null> {
    const rows = await this.readRelation<{ columns: unknown; joins: unknown }>(
      `SELECT columns, joins FROM master_tables WHERE project_id = $1 AND status = 'active' LIMIT 1`,
      [projectId],
      'master_tables'
    );
    if (!rows) {
      return null;
    }
    return rows[0] || null;
  }

  private async inactivateRowAccess(projectId: string): Promise<void> {
    await this.readRelation(
      `UPDATE user_row_access
       SET status = 'inactive', updated_at = NOW()
       WHERE master_row_id IN (
         SELECT mr.master_row_id
         FROM master_rows mr
         JOIN master_tables mt ON mt.master_id = mr.master_id
         WHERE mt.project_id = $1
       )`,
      [projectId],
      'user_row_access'
    );
  }

  private async scalarCount(sql: string, params: string[], relation: string): Promise<number | null> {
    const rows = await this.readRelation<{ count: number }>(sql, params, relation);
    if (!rows) {
      return null;
    }
    return Number(rows[0]?.count || 0);
  }

  private async readRelation<T>(sql: string, params: string[], relation: string): Promise<T[] | null> {
    try {
      return await this.connection.query(sql, params);
    } catch (error) {
      const code = (error as { code?: string }).code;
      this.logger.error(`Query failed for ${relation}: ${error}`);
      if (code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  masterReferencesTable(columns: unknown, joins: unknown, tableId: string): boolean {
    return masterTableReferences(columns, joins, tableId);
  }

  private mapToResponse(project: any, publishConditions?: string[]): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.project_id = project.project_id;
    dto.name = project.name;
    dto.org_id = project.org_id;
    dto.status = project.status;
    dto.created_at = project.created_at;
    dto.updated_at = project.updated_at;
    if (publishConditions) {
      dto.publish_conditions = publishConditions;
    }
    return dto;
  }
}
