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
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post("signup")
  create(@Req() req, @Res() res) {
    return this.usersService.create(req, res);
  }

  @Post("login")
  login(@Req() req, @Res() res) {
    return this.usersService.login(req, res);
  }

  @Get("userInfo")
  userInfo(@Req() req, @Res() res) {
    return this.usersService.userInfo(req, res);
  }
}
