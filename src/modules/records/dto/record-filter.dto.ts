import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { RecordType } from "@prisma/client";

export class RecordFilterDto {
  @ApiPropertyOptional({ example: 1, description: "Page number (1-based)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: "Page size (max 100)", maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @ApiPropertyOptional({ example: "Food", description: "Exact category match (case-insensitive)" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ example: "salary", description: "Search in category or note (case-insensitive)" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ["date", "amount", "category", "createdAt"], default: "date" })
  @IsOptional()
  @IsIn(["date", "amount", "category", "createdAt"])
  sortBy?: "date" | "amount" | "category" | "createdAt" = "date";

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc" = "desc";
}
