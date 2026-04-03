import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { RecordType } from "@prisma/client";

export class CreateRecordDto {
  @ApiProperty({ example: 1250.5, description: "Must be greater than 0", minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: RecordType, example: RecordType.INCOME })
  @IsEnum(RecordType)
  type: RecordType;

  @ApiProperty({ example: "Salary" })
  @IsString()
  category: string;

  @ApiProperty({ example: "2026-04-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional({ example: "Monthly salary" })
  @IsOptional()
  @IsString()
  note?: string;
}

