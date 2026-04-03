import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { ResponseMessage } from "../../common/decorators/response-message.decorator";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { DashboardService } from "./dashboard.service";
import { DashboardDateRangeDto, DashboardRecentQueryDto, DashboardTrendsQueryDto } from "./dto/dashboard-query.dto";

@ApiTags("dashboard")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("dashboard")
@Roles(Role.VIEWER, Role.ANALYST, Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @ResponseMessage("Summary fetched successfully")
  @ApiOperation({
    summary: "Income, expense, and net balance",
    description: "Optional startDate/endDate (YYYY-MM-DD, inclusive). Non-ADMIN: scoped to your records.",
  })
  @ApiResponse({ status: 200, description: "totalIncome, totalExpense, netBalance" })
  async summary(@CurrentUser() user: RequestUser, @Query() query: DashboardDateRangeDto) {
    return this.dashboardService.summary(user, query.startDate, query.endDate);
  }

  @Get("category-breakdown")
  @ResponseMessage("Category breakdown fetched successfully")
  @ApiOperation({
    summary: "Per-category net totals",
    description: "Each item: { category, total } where total = income − expense for that category.",
  })
  @ApiResponse({
    status: 200,
    description: "Array of { category, total }",
    schema: {
      example: {
        status: "success",
        message: "Category breakdown fetched successfully",
        data: [
          { category: "Salary", total: 2000 },
          { category: "Food", total: -500 },
        ],
      },
    },
  })
  async categoryBreakdown(@CurrentUser() user: RequestUser, @Query() query: DashboardDateRangeDto) {
    return this.dashboardService.categoryBreakdown(user, query.startDate, query.endDate);
  }

  @Get("trends")
  @ResponseMessage("Trends fetched successfully")
  @ApiOperation({
    summary: "Time series by month or week",
    description: "groupBy=month|week. Optional date range. Returns periods with income, expense, net.",
  })
  @ApiResponse({ status: 200, description: "Array of { period, income, expense, net }" })
  async trends(@CurrentUser() user: RequestUser, @Query() query: DashboardTrendsQueryDto) {
    const groupBy = query.groupBy ?? "month";
    return this.dashboardService.trends(user, groupBy, query.startDate, query.endDate);
  }

  @Get("recent")
  @ResponseMessage("Recent records fetched successfully")
  @ApiOperation({ summary: "Most recent records (default 5)" })
  @ApiResponse({ status: 200, description: "List of records" })
  async recent(@CurrentUser() user: RequestUser, @Query() query: DashboardRecentQueryDto) {
    return this.dashboardService.recent(user, query.limit ?? 5);
  }
}
