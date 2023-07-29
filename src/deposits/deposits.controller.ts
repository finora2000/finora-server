import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { DepositsService } from "./deposits.service";

@Controller("api/deposits")
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}
  @Post("new")
  addDeposit(@Req() req, @Res() res) {
    this.depositsService.addDeposit(req, res);
  }
}
