import { Controller, Post, Body, Param, Get, Put } from "@nestjs/common";
import { CertificateService } from "./certificate.service";
import { Certificate } from "./entities/certificate.entity";
import { User } from "../user/entities/user.entity";

@Controller("certificates")
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post("issue")
  issue(@Body() data: Partial<Certificate>): Promise<Certificate> {
    return this.certificateService.issueCertificate(data);
  }

  @Get("verify/:id")
  verify(@Param("id") id: string) {
    return this.certificateService.verifyCertificate(id);
  }

  @Put("transfer/:id")
  transfer(@Param("id") id: string, @Body("newOwner") newOwner: User) {
    return this.certificateService.transferCertificate(id, newOwner);
  }

  @Put("revoke/:id")
  revoke(@Param("id") id: string, @Body("reason") reason: string) {
    return this.certificateService.revokeCertificate(id, reason);
  }
}
