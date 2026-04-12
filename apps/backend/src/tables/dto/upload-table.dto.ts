import { IsUUID } from 'class-validator';

export class UploadTableDto {
  @IsUUID()
  project_id: string;
}