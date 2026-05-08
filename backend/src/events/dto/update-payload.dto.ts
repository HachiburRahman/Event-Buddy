import { IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UpdateEventDto } from './update-event.dto';

export class UpdatePayloadDto {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UpdateEventDto)
  data: UpdateEventDto;
}