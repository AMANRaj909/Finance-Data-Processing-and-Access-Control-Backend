import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma, Role, Status } from "@prisma/client";
import { hash } from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";

type SafeUser = {
  id: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
};

type AuthUser = {
  id: string;
  email: string;
  role: Role;
  status: Status;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<SafeUser> {
    const passwordHash = await hash(dto.password, 10);

    try {
      const role = dto.role ?? Role.VIEWER;
      const status = dto.status ?? Status.ACTIVE;

      const created = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: passwordHash,
          role,
          status,
        },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User created id=${created.id} email=${created.email} role=${created.role}`);
      return created;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002 = unique constraint failed
        if (err.code === "P2002") {
          throw new ConflictException("Email already exists");
        }
      }
      throw err;
    }
  }

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto): Promise<SafeUser> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { status: dto.status },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundException("User not found");
      }
      throw err;
    }
  }

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<SafeUser> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { role: dto.role },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundException("User not found");
      }
      throw err;
    }
  }

  // Used by Auth (JWT strategy) and login.
  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        password: true,
      },
    });
  }

  async findById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        password: true,
      },
    });
  }
}

