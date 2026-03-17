import { IsString, IsUUID } from "class-validator";

export class EnqueueClearingDto {
  @IsString()
  @IsUUID()
  dealId!: string;
}
