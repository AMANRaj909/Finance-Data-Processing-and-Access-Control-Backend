import { Injectable } from "@nestjs/common";
import { Prisma, RecordType, Role } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

type AuthUser = {
  userId: string;
  role: Role;
};

export type SummaryResponse = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
};

export type CategoryBreakdownRow = {
  category: string;
  total: number;
};

export type TrendRow = {
  period: string;
  income: number;
  expense: number;
  net: number;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(user: AuthUser, startDate?: string, endDate?: string): Promise<SummaryResponse> {
    const whereBase = this.buildBaseWhere(user, startDate, endDate);

    const incomeAgg = await this.prisma.record.aggregate({
      where: { ...whereBase, type: RecordType.INCOME },
      _sum: { amount: true },
    });

    const expenseAgg = await this.prisma.record.aggregate({
      where: { ...whereBase, type: RecordType.EXPENSE },
      _sum: { amount: true },
    });

    const totalIncome = incomeAgg._sum.amount ?? 0;
    const totalExpense = expenseAgg._sum.amount ?? 0;
    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  }

  async categoryBreakdown(user: AuthUser, startDate?: string, endDate?: string): Promise<CategoryBreakdownRow[]> {
    const whereBase = this.buildBaseWhere(user, startDate, endDate);

    const rows = await this.prisma.record.groupBy({
      by: ["category", "type"],
      where: whereBase,
      _sum: { amount: true },
    });

    const map = new Map<string, { income: number; expense: number }>();
    for (const r of rows) {
      const current = map.get(r.category) ?? { income: 0, expense: 0 };
      const v = r._sum?.amount ?? 0;
      if (r.type === RecordType.INCOME) current.income = v;
      if (r.type === RecordType.EXPENSE) current.expense = v;
      map.set(r.category, current);
    }

    const items: CategoryBreakdownRow[] = [];
    for (const [category, v] of map.entries()) {
      items.push({ category, total: v.income - v.expense });
    }

    items.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    return items;
  }

  async trends(
    user: AuthUser,
    groupBy: "month" | "week",
    startDate?: string,
    endDate?: string,
  ): Promise<TrendRow[]> {
    const start = this.resolveTrendRangeStart(groupBy, startDate, endDate);
    const end = this.resolveTrendRangeEnd(groupBy, startDate, endDate);

    const rows =
      groupBy === "month"
        ? await this.trendRowsMonth(user, start, end)
        : await this.trendRowsWeek(user, start, end);

    const labelForBucket = (d: Date): string => {
      if (groupBy === "month") {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        return `${y}-${m}`;
      }
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const index = new Map<string, { income: number; expense: number }>();
    for (const r of rows) {
      const key = labelForBucket(new Date(r.bucket));
      const cur = index.get(key) ?? { income: 0, expense: 0 };
      if (r.type === RecordType.INCOME) cur.income = r.total;
      if (r.type === RecordType.EXPENSE) cur.expense = r.total;
      index.set(key, cur);
    }

    return Array.from(index.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, v]) => ({
        period,
        income: v.income,
        expense: v.expense,
        net: v.income - v.expense,
      }));
  }

  private async trendRowsMonth(
    user: AuthUser,
    start: Date,
    end: Date,
  ): Promise<Array<{ bucket: Date; type: RecordType; total: number }>> {
    if (user.role === Role.ADMIN) {
      return this.prisma.$queryRaw<
        Array<{ bucket: Date; type: RecordType; total: number }>
      >`
        SELECT date_trunc('month', "date") AS bucket,
               "type",
               SUM("amount")::float AS total
        FROM "Record"
        WHERE "isDeleted" = false
          AND "date" >= ${start}
          AND "date" <= ${end}
        GROUP BY date_trunc('month', "date"), "type"
        ORDER BY date_trunc('month', "date")
      `;
    }
    return this.prisma.$queryRaw<
      Array<{ bucket: Date; type: RecordType; total: number }>
    >`
      SELECT date_trunc('month', "date") AS bucket,
             "type",
             SUM("amount")::float AS total
      FROM "Record"
      WHERE "isDeleted" = false
        AND "createdBy" = ${user.userId}
        AND "date" >= ${start}
        AND "date" <= ${end}
      GROUP BY date_trunc('month', "date"), "type"
      ORDER BY date_trunc('month', "date")
    `;
  }

  private async trendRowsWeek(
    user: AuthUser,
    start: Date,
    end: Date,
  ): Promise<Array<{ bucket: Date; type: RecordType; total: number }>> {
    if (user.role === Role.ADMIN) {
      return this.prisma.$queryRaw<
        Array<{ bucket: Date; type: RecordType; total: number }>
      >`
        SELECT date_trunc('week', "date") AS bucket,
               "type",
               SUM("amount")::float AS total
        FROM "Record"
        WHERE "isDeleted" = false
          AND "date" >= ${start}
          AND "date" <= ${end}
        GROUP BY date_trunc('week', "date"), "type"
        ORDER BY date_trunc('week', "date")
      `;
    }
    return this.prisma.$queryRaw<
      Array<{ bucket: Date; type: RecordType; total: number }>
    >`
      SELECT date_trunc('week', "date") AS bucket,
             "type",
             SUM("amount")::float AS total
      FROM "Record"
      WHERE "isDeleted" = false
        AND "createdBy" = ${user.userId}
        AND "date" >= ${start}
        AND "date" <= ${end}
      GROUP BY date_trunc('week', "date"), "type"
      ORDER BY date_trunc('week', "date")
    `;
  }

  async recent(user: AuthUser, limit = 5) {
    const where: Prisma.RecordWhereInput = { isDeleted: false };
    if (user.role !== Role.ADMIN) where.createdBy = user.userId;

    return this.prisma.record.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  private buildBaseWhere(user: AuthUser, startDate?: string, endDate?: string): Prisma.RecordWhereInput {
    const where: Prisma.RecordWhereInput = { isDeleted: false };
    if (user.role !== Role.ADMIN) where.createdBy = user.userId;

    const dr = this.dateRangeFilter(startDate, endDate);
    if (dr) where.date = dr;

    return where;
  }

  private dateRangeFilter(startDate?: string, endDate?: string): Prisma.DateTimeFilter | undefined {
    if (!startDate && !endDate) return undefined;
    const range: Prisma.DateTimeFilter = {};
    if (startDate) range.gte = this.parseDayStartUtc(startDate);
    if (endDate) range.lte = this.parseDayEndUtc(endDate);
    return range;
  }

  private parseDayStartUtc(isoDate: string): Date {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }

  private parseDayEndUtc(isoDate: string): Date {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
  }

  private resolveTrendRangeStart(groupBy: "month" | "week", startDate?: string, endDate?: string): Date {
    if (startDate) return this.parseDayStartUtc(startDate);
    const end = endDate ? this.parseDayEndUtc(endDate) : new Date();
    const start = new Date(end);
    if (groupBy === "week") start.setUTCDate(start.getUTCDate() - 7 * 11);
    else start.setUTCMonth(start.getUTCMonth() - 11);
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }

  private resolveTrendRangeEnd(groupBy: "month" | "week", startDate?: string, endDate?: string): Date {
    if (endDate) return this.parseDayEndUtc(endDate);
    if (startDate) {
      const s = this.parseDayStartUtc(startDate);
      const e = new Date(s);
      if (groupBy === "week") e.setUTCDate(e.getUTCDate() + 7 * 11);
      else e.setUTCMonth(e.getUTCMonth() + 11);
      e.setUTCHours(23, 59, 59, 999);
      return e;
    }
    return new Date();
  }
}
