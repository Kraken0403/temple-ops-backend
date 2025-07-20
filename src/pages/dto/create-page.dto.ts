// src/pages/dto/create-page.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;            // “!” tells TS this will be assigned

  @IsString()
  @IsNotEmpty()
  title!: string;           // required

  @IsString()
  @IsOptional()             // now optional
  template?: string;

  @IsObject()
  @IsOptional()             // now optional
  content?: Record<string, any>;

  @IsObject()
  @IsOptional()
  meta?: Record<string, any>;
}
