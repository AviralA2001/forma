import { IsString, MinLength, MaxLength } from 'class-validator';

export class RenameTableDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  new_name: string;
}