import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "trader@firma.de" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Passwort123!" })
  @IsString()
  @MinLength(8)
  password: string;
}
