import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class RenameColumnDto {

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  new_name: string;
}