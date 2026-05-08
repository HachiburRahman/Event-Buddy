import { IsUUID } from 'class-validator';

export class IdentifierDto {
  @IsUUID()
  id: string;
}