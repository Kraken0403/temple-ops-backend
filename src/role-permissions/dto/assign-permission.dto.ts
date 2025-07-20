import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class AssignPermissionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permissionIds!: number[];
}
