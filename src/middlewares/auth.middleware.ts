import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { Model } from "mongoose";
import { User } from "src/schemas/UserSchema";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authToken =
      req.cookies?.auth_token || req.headers.authorization?.split("Bearer ")[1];
    if (!authToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    try {
      const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
      const { userId } = decodedToken;
      const user = (await this.UserModel.findById(userId)).toJSON();

      if (!user) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      req["userInfo"] = user;

      next();
    } catch (error) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
  }
}
