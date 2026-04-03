import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Role, Status } from "@prisma/client";
import { UsersService } from "../../users/users.service";

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") ?? "change-me",
    });
  }

  async validate(payload: JwtPayload): Promise<{
    userId: string;
    email: string;
    role: Role;
    status: Status;
  }> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.status !== "ACTIVE") throw new UnauthorizedException("Invalid or inactive user");

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}

