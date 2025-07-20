import { IsEmail, IsString, MinLength, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsEmail()           email!: string;
  @IsString() @MinLength(6)  password!: string;
  @IsArray() @ArrayNotEmpty() @IsInt({ each: true })
                       roles!: number[]; // array of Role IDs
}
