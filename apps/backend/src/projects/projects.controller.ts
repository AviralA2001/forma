import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// TODO: Replace with actual authenticated user when auth is implemented
const PLACEHOLDER_org_id = '550e8400-e29b-41d4-a716-446655440000';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@CurrentUser() user: any, @Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projectsService.createProject(user.org_id, dto);
  }

  @Get()
  async getProjects(@CurrentUser() user: any): Promise<ProjectResponseDto[]> {
    return this.projectsService.getProjects(user.org_id);
  }

  @Get(':id')
  async getProject(@CurrentUser() user: any, @Param('id') projectId: string): Promise<ProjectResponseDto> {
    return this.projectsService.getProject(projectId, user.org_id);
  }

  @Patch(':id')
  async updateProject(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateProject(projectId, user.org_id, dto);
  }

  @Delete(':id')
  async deleteProject(@CurrentUser() user: any, @Param('id') projectId: string): Promise<void> {
    return this.projectsService.deleteProject(projectId, user.org_id, );
  }
}
