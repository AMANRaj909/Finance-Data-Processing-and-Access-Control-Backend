import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Status } from "@prisma/client";

export class UpdateUserStatusDto {
  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status: Status;
}

