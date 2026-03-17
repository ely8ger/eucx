import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Validiert Bearer JWT aus Authorization-Header via JwtStrategy */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
