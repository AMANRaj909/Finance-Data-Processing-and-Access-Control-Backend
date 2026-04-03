import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ResponseMessage } from "./common/decorators/response-message.decorator";
import { AppService } from "./app.service";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ResponseMessage("Service is running")
  @ApiOperation({ summary: "Health / root" })
  @ApiResponse({
    status: 200,
    description: "Plain greeting string inside data",
    schema: { example: { status: "success", message: "Service is running", data: "Hello World!" } },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
