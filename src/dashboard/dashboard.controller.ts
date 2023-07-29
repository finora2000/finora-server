import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("api/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Req() req, @Res() res) {
    return this.dashboardService.findAll(req, res);
  }
}
