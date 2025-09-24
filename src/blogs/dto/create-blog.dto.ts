import { IsArray, IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBlogDto {
  @IsString() title!: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsUrl() coverImageUrl?: string;
  @IsOptional() @IsString() bodyHtml?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() categoryId?: number;
  @IsOptional() @IsString() authorName?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsString() slug?: string;
}
