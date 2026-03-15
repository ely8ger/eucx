import { Controller, Post, Body, Req } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Anmelden und JWT-Token erhalten" })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = (req.headers["x-forwarded-for"] as string) ?? req.ip ?? "unknown";
    return this.auth.login(dto, ip);
  }
}
