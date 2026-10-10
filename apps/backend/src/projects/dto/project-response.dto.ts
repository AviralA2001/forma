import { Expose } from 'class-transformer';

export class ProjectResponseDto {
  @Expose()
  project_id: string;

  @Expose()
  name: string;

  @Expose()
  org_id: string;

  @Expose()
  status: 'draft' | 'published' | 'closed';

  @Expose()
  publish_conditions?: string[];

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
