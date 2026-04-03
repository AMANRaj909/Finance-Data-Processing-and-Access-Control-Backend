import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role, Status } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty({ example: "admin@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: Role, default: Role.VIEWER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}

