import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { ResponseMessage } from "../../common/decorators/response-message.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @ResponseMessage("User created successfully")
  @ApiOperation({ summary: "Create a user (ADMIN)" })
  @ApiResponse({
    status: 201,
    description: "User created (password never returned)",
    schema: {
      example: {
        status: "success",
        message: "User created successfully",
        data: {
          id: "uuid",
          email: "analyst@example.com",
          role: "ANALYST",
          status: "ACTIVE",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden — ADMIN only" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ResponseMessage("Users fetched successfully")
  @ApiOperation({ summary: "List all users (ADMIN)" })
  @ApiResponse({ status: 200, description: "List of users without passwords" })
  async listUsers() {
    return this.usersService.findAll();
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN)
  @ResponseMessage("User status updated successfully")
  @ApiOperation({ summary: "Update user status (ADMIN)" })
  @ApiResponse({ status: 200, description: "Updated user" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto);
  }

  @Patch(":id/role")
  @Roles(Role.ADMIN)
  @ResponseMessage("User role updated successfully")
  @ApiOperation({ summary: "Update user role (ADMIN)" })
  @ApiResponse({ status: 200, description: "Updated user" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateRole(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, dto);
  }
}
