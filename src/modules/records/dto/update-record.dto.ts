import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString, ValidateIf } from "class-validator";
import { RecordType } from "@prisma/client";

export class UpdateRecordDto {
  @ApiPropertyOptional({ example: 1250.5, description: "Must be greater than 0 when provided" })
  @ValidateIf((o: UpdateRecordDto) => o.amount !== undefined)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @ApiPropertyOptional({ example: "Salary" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: "2026-04-01T00:00:00.000Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({ example: "Monthly salary" })
  @IsOptional()
  @IsString()
  note?: string;
}

