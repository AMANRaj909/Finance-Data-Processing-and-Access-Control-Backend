import { DocumentBuilder } from "@nestjs/swagger";

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle("Finance Data Processing Backend")
    .setDescription(
      "Finance records API with JWT auth, role-based access (ADMIN / ANALYST / VIEWER), CRUD + soft delete, " +
        "and dashboard metrics. Successful JSON responses are wrapped as { status, message, data } (plus meta for paginated lists).",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "JWT from POST /auth/login",
        in: "header",
      },
      "JWT",
    )
    .addTag("auth", "Login and tokens")
    .addTag("users", "User management (ADMIN)")
    .addTag("records", "Financial records")
    .addTag("dashboard", "Analytics")
    .addTag("app", "Health check")
    .build();
}

export const swaggerUiOptions = {
  customSiteTitle: "Finance API",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "list" as const,
    filter: true,
    showRequestDuration: true,
  },
};
