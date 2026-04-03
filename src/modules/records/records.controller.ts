import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { ResponseMessage } from "../../common/decorators/response-message.decorator";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateRecordDto } from "./dto/create-record.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { RecordFilterDto } from "./dto/record-filter.dto";
import { RecordsService } from "./records.service";

@ApiTags("records")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("records")
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ANALYST, Role.ADMIN)
  @ResponseMessage("Record created successfully")
  @ApiOperation({ summary: "Create a financial record (ANALYST, ADMIN)" })
  @ApiResponse({ status: 201, description: "Record created" })
  @ApiResponse({ status: 403, description: "Insufficient role" })
  async create(@Body() dto: CreateRecordDto, @CurrentUser() user: RequestUser) {
    return this.recordsService.create(dto, user);
  }

  @Get()
  @Roles(Role.ANALYST, Role.ADMIN)
  @ResponseMessage("Records fetched successfully")
  @ApiOperation({
    summary: "List records with pagination, filters, search, and sort",
    description:
      "Supports page/limit, type, category, date range, search (category/note), sortBy (date|amount|category|createdAt), order (asc|desc). Non-ADMIN users see only their own records.",
  })
  @ApiResponse({
    status: 200,
    description: "Wrapped list with meta: { page, limit, total }",
    schema: {
      example: {
        status: "success",
        message: "Records fetched successfully",
        data: [],
        meta: { page: 1, limit: 10, total: 45 },
      },
    },
  })
  async list(@Query() dto: RecordFilterDto, @CurrentUser() user: RequestUser) {
    return this.recordsService.findAll(dto, user);
  }

  @Get(":id")
  @Roles(Role.ANALYST, Role.ADMIN)
  @ResponseMessage("Record fetched successfully")
  @ApiOperation({ summary: "Get one record by id" })
  @ApiResponse({ status: 200, description: "Record" })
  @ApiResponse({ status: 404, description: "Not found" })
  async getOne(@Param("id", new ParseUUIDPipe()) id: string, @CurrentUser() user: RequestUser) {
    return this.recordsService.findOne(id, user);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ResponseMessage("Record updated successfully")
  @ApiOperation({ summary: "Update a record (ADMIN)" })
  @ApiResponse({ status: 200, description: "Updated record" })
  @ApiResponse({ status: 403, description: "ADMIN only" })
  @ApiResponse({ status: 404, description: "Not found" })
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRecordDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.recordsService.update(id, dto, user);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ResponseMessage("Record deleted successfully")
  @ApiOperation({ summary: "Soft-delete a record (ADMIN)" })
  @ApiResponse({ status: 200, description: "Record marked isDeleted" })
  @ApiResponse({ status: 404, description: "Not found" })
  async remove(@Param("id", new ParseUUIDPipe()) id: string, @CurrentUser() user: RequestUser) {
    return this.recordsService.softDelete(id, user);
  }
}
