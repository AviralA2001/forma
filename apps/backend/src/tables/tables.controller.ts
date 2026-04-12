import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TablesService } from './tables.service';
import { UploadTableDto } from './dto/upload-table.dto';
import { RenameTableDto } from './dto/rename-table.dto';
import { RenameColumnDto } from './dto/rename-column.dto';
import { TableResponseDto } from './dto/table-response.dto';
import { TableDetailResponseDto } from './dto/table-detail-response.dto';

// TODO: Replace with actual authenticated user when auth is implemented
const PLACEHOLDER_OWNER_ID = '550e8400-e29b-41d4-a716-446655440000';

@Controller('projects/:projectId/tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTable(
    @Param('projectId') projectId: string,
    @UploadedFile() file: any,
  ): Promise<TableResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are supported');
    }

    // TODO: Verify user owns the project

    const table = await this.tablesService.uploadTable(projectId, file.buffer, file.originalname);

    return {
      table_id: table.table_id,
      name: table.name,
      column_count: table.columns.length,
      row_count: table.row_count,
      created_at: table.created_at,
    };
  }

  @Get()
  async getTables(@Param('projectId') projectId: string): Promise<TableResponseDto[]> {
    // TODO: Verify user owns the project

    const tables = await this.tablesService.getTables(projectId);
    return tables.map(table => ({
      table_id: table.table_id,
      name: table.name,
      column_count: table.columns.length,
      row_count: table.row_count,
      created_at: table.created_at,
    }));
  }

  @Get(':tableId')
  async getTableDetail(
    @Param('projectId') projectId: string,
    @Param('tableId') tableId: string,
  ): Promise<TableDetailResponseDto> {
    // TODO: Verify user owns the project and table belongs to project

    const { table, rows } = await this.tablesService.getTableDetail(tableId);
    return {
      table_id: table.table_id,
      name: table.name,
      columns: table.columns,
      rows,
    };
  }

  @Patch(':tableId')
  async renameTable(
    @Param('projectId') projectId: string,
    @Param('tableId') tableId: string,
    @Body() dto: RenameTableDto,
  ): Promise<TableResponseDto> {
    // TODO: Verify user owns the project and table belongs to project

    const table = await this.tablesService.renameTable(tableId, dto.new_name);
    return {
      table_id: table.table_id,
      name: table.name,
      column_count: table.columns.length,
      row_count: table.row_count,
      created_at: table.created_at,
    };
  }

  @Patch(':tableId/columns/:columnId')
  async renameColumn(
    @Param('projectId') projectId: string,
    @Param('tableId') tableId: string,
    @Param('columnId') columnId: string,
    @Body() dto: RenameColumnDto,
  ): Promise<TableDetailResponseDto> {
    // TODO: Verify user owns the project and table belongs to project

    const { table, rows } = await this.tablesService.renameColumn(tableId, columnId, dto.new_name);
    return {
      table_id: table.table_id,
      name: table.name,
      columns: table.columns,
      rows,
    };
  }

  @Delete(':tableId')
  async deleteTable(
    @Param('projectId') projectId: string,
    @Param('tableId') tableId: string,
  ): Promise<void> {
    // TODO: Verify user owns the project and table belongs to project

    await this.tablesService.deleteTable(tableId);
  }

  @Post(':tableId/reupload')
  @UseInterceptors(FileInterceptor('file'))
  async reuploadTable(
    @Param('projectId') projectId: string,
    @Param('tableId') tableId: string,
    @UploadedFile() file: any,
  ): Promise<TableDetailResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are supported');
    }

    // TODO: Verify user owns the project and table belongs to project

    const { table, rows } = await this.tablesService.reuploadTable(tableId, file.buffer);
    return {
      table_id: table.table_id,
      name: table.name,
      columns: table.columns,
      rows,
    };
  }
}