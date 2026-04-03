import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Reflector } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { buildSwaggerConfig, swaggerUiOptions } from "./config/swagger.config";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if ((configService.get<string>("SWAGGER_ENABLED") ?? "true") === "true") {
    const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
    SwaggerModule.setup("api-docs", app, document, swaggerUiOptions);
  }

  const port = parseInt(process.env.PORT || "3000", 10);
await app.listen(port);
}
bootstrap();
