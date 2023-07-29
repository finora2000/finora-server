import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request, Response } from "express";
import { Model } from "mongoose";
import { User } from "src/schemas/UserSchema";
import { SignupDto } from "./dto/users.dto";
import { PortfolioDetails } from "src/schemas/PortfolioDetailsSchema";
import { PortfolioHistory } from "src/schemas/PortfolioHistorySchema";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(PortfolioDetails.name)
    private PortfolioDetailsModel: Model<PortfolioDetails>,
    @InjectModel(PortfolioHistory.name)
    private PortfolioHistoryModel: Model<PortfolioHistory>
  ) {}

  async create(req: Request, res: Response) {
    try {
      const body: SignupDto = req.body;

      const emailExist = this.UserModel.find({ email: body.email });
      if (emailExist) {
        return res.status(400).json({ msg: "Email is already registered!" });
      }
      const newUser = new this.UserModel({
        ...body,
      });
      const portfolioDetails = new this.PortfolioDetailsModel({
        userId: newUser.id,
      });
      const portfolioHistory = new this.PortfolioHistoryModel({
        userId: newUser.id,
      });
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );
      Promise.all([
        portfolioHistory.save(),
        portfolioDetails.save(),
        newUser.save(),
      ]);
      res.cookie("auth_token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ user: newUser, portfolioDetails, token });
    } catch (Err) {
      console.log(Err.message);
      res.status(500).json({ msg: Err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const userExist = await this.UserModel.findOne({ email });
      if (!userExist)
        return res
          .status(400)
          .json({ msg: "Either email or password is incorrect" });

      bcrypt.compare(password, userExist.password, async (err, data) => {
        delete userExist.password;
        if (data) {
          const token = jwt.sign(
            { userId: userExist._id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "7d",
            }
          );
          res.cookie("auth_token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          const portfolioDetails = await this.PortfolioDetailsModel.findOne(
            {
              userId: userExist._id,
            },
            { cash: true, invested: true, savings: true, _id: false }
          );
          return res.json({
            token,
            user: userExist,
            portfolioDetails,
            msg: "Login Successful",
          });
        } else {
          return res
            .status(400)
            .json({ msg: "Either email or password is incorrect" });
        }
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }

  async userInfo(req, res) {
    try {
      const userInfo = req["userInfo"];
      res.json(userInfo);
    } catch {
      res.status(500).json({});
    }
  }
}
