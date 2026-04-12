import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

// TODO: Replace with actual authenticated user when auth is implemented
const PLACEHOLDER_OWNER_ID = '550e8400-e29b-41d4-a716-446655440000';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projectsService.createProject(PLACEHOLDER_OWNER_ID, dto);
  }

  @Get()
  async getProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsService.getProjects(PLACEHOLDER_OWNER_ID);
  }

  @Get(':id')
  async getProject(@Param('id') projectId: string): Promise<ProjectResponseDto> {
    return this.projectsService.getProject(projectId, PLACEHOLDER_OWNER_ID);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateProject(projectId, PLACEHOLDER_OWNER_ID, dto);
  }

  @Delete(':id')
  async deleteProject(@Param('id') projectId: string): Promise<void> {
    return this.projectsService.deleteProject(projectId, PLACEHOLDER_OWNER_ID);
  }
}
