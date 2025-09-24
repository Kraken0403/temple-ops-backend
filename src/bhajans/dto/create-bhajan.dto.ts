// src/bhajans/dto/create-bhajan.dto.ts
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBhajanDto {
  @IsString() title!: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() categoryId?: number;

  @IsString() pdfUrl!: string;           // was @IsUrl()
  @IsOptional() @IsString() lyricsHtml?: string;
  @IsOptional() @IsString() audioUrl?: string;
  @IsOptional() @IsString() thumbnailUrl?: string;

  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsString() slug?: string;
}
