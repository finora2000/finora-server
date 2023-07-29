import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { GoalsService } from "./goals.service";
import { Req, Res } from "@nestjs/common/decorators";

@Controller("api/goals")
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post("create")
  create(@Req() req, @Res() res) {
    return this.goalsService.create(req, res);
  }
}
