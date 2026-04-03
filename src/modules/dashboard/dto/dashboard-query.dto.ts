import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

/** Optional YYYY-MM-DD range for dashboard aggregations (inclusive). */
export class DashboardDateRangeDto {
  @ApiPropertyOptional({ description: "Start date (inclusive), ISO date", example: "2026-01-01" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "End date (inclusive), ISO date", example: "2026-12-31" })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DashboardTrendsQueryDto extends DashboardDateRangeDto {
  @ApiPropertyOptional({
    enum: ["month", "week"],
    description: "Bucket size for trend series",
    default: "month",
  })
  @IsOptional()
  @IsIn(["month", "week"])
  groupBy?: "month" | "week" = "month";
}

export class DashboardRecentQueryDto {
  @ApiPropertyOptional({ description: "Number of recent records", example: 5, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 5;
}
