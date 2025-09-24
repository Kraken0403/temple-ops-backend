import { PartialType } from '@nestjs/mapped-types';
import { CreateBhajanDto } from './create-bhajan.dto';

export class UpdateBhajanDto extends PartialType(CreateBhajanDto) {}
