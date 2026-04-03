import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    this.logger.log(`Login attempt email=${dto.email}`);

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`Login failed email=${dto.email} reason=user_not_found`);
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      this.logger.warn(`Login failed email=${dto.email} reason=inactive`);
      throw new UnauthorizedException("Account is inactive");
    }

    const isPasswordValid = await compare(dto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed email=${dto.email} reason=invalid_password`);
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.jwtService.signAsync(
      {
        email: user.email,
        role: user.role,
      },
      {
        subject: user.id,
      },
    );

    this.logger.log(`Login success userId=${user.id} role=${user.role}`);
    return { accessToken };
  }
}

