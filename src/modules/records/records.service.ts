import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRecordDto } from "./dto/create-record.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { RecordFilterDto } from "./dto/record-filter.dto";

type AuthUser = {
  userId: string;
  role: Role;
};

type PaginatedRecords<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRecordDto, user: AuthUser) {
    const record = await this.prisma.record.create({
      data: {
        amount: dto.amount,
        type: dto.type,
        category: dto.category,
        date: dto.date,
        note: dto.note ?? null,
        createdBy: user.userId,
      },
    });
    this.logger.log(
      `Record created id=${record.id} type=${record.type} amount=${record.amount} userId=${user.userId}`,
    );
    return record;
  }

  async findAll(dto: RecordFilterDto, user: AuthUser): Promise<PaginatedRecords<any>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) throw new BadRequestException("Invalid pagination parameters");

    const where: Prisma.RecordWhereInput = {
      isDeleted: false,
    };

    if (dto.type) where.type = dto.type;

    if (dto.category) {
      where.category = { equals: dto.category, mode: "insensitive" };
    }

    if (dto.startDate || dto.endDate) {
      where.date = {
        ...(dto.startDate ? { gte: dto.startDate } : {}),
        ...(dto.endDate ? { lte: dto.endDate } : {}),
      };
    }

    const q = dto.search?.trim();
    if (q) {
      where.OR = [
        { category: { contains: q, mode: "insensitive" } },
        { note: { contains: q, mode: "insensitive" } },
      ];
    }

    if (user.role !== Role.ADMIN) {
      where.createdBy = user.userId;
    }

    const orderDir = dto.order === "asc" ? "asc" : "desc";
    const sort = dto.sortBy ?? "date";
    const orderBy: Prisma.RecordOrderByWithRelationInput[] = [];
    switch (sort) {
      case "amount":
        orderBy.push({ amount: orderDir });
        break;
      case "category":
        orderBy.push({ category: orderDir });
        break;
      case "createdAt":
        orderBy.push({ createdAt: orderDir });
        break;
      default:
        orderBy.push({ date: orderDir });
    }
    if (sort !== "createdAt") {
      orderBy.push({ createdAt: "desc" });
    }

    const total = await this.prisma.record.count({ where });

    const data = await this.prisma.record.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string, user: AuthUser) {
    const record = await this.prisma.record.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(user.role !== Role.ADMIN ? { createdBy: user.userId } : {}),
      },
    });

    if (!record) throw new NotFoundException("Record not found");
    return record;
  }

  async update(id: string, dto: UpdateRecordDto, user: AuthUser) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException("Insufficient permissions");

    const existing = await this.prisma.record.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Record not found");

    return this.prisma.record.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.date !== undefined ? { date: dto.date } : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
      },
    });
  }

  async softDelete(id: string, user: AuthUser) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException("Insufficient permissions");

    const result = await this.prisma.record.updateMany({
      where: { id, isDeleted: false },
      data: { isDeleted: true },
    });

    if (result.count === 0) throw new NotFoundException("Record not found");

    return this.prisma.record.findUniqueOrThrow({ where: { id } });
  }
}

