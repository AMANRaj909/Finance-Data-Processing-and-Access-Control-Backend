import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ResponseMessage } from "../../common/decorators/response-message.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ResponseMessage("Login successful")
  @ApiOperation({ summary: "Authenticate with email and password", description: "Returns a JWT access token. Use Authorization: Bearer <token> on protected routes." })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Wrapped as { status, message, data: { accessToken } }",
    schema: {
      example: {
        status: "success",
        message: "Login successful",
        data: { accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials or inactive account" })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }
}
