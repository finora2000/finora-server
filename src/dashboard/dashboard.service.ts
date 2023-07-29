import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request, Response } from "express";
import { Model } from "mongoose";
import { Deposits } from "src/schemas/DepositsSchema";
import { GoalsInvestment } from "src/schemas/GoalInvestmentSchema";
import { Goals } from "src/schemas/GoalSchema";
import { PortfolioDetails } from "src/schemas/PortfolioDetailsSchema";
import { PortfolioHistory } from "src/schemas/PortfolioHistorySchema";
import { User } from "src/schemas/UserSchema";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Deposits.name) private DepositsModel: Model<Deposits>,
    @InjectModel(Goals.name) private GoalsModel: Model<Goals>,
    @InjectModel(PortfolioDetails.name)
    private PortfolioDetailsModel: Model<PortfolioDetails>,
    @InjectModel(PortfolioHistory.name)
    private PortfolioHistoryModel: Model<PortfolioHistory>,
    @InjectModel(GoalsInvestment.name)
    private GoalsInvestmentModel: Model<GoalsInvestment>
  ) {}

  async findAll(req: Request, res: Response) {
    try {
      const userInfo = req["userInfo"];
      let goals = await this.GoalsModel.find({
        userId: userInfo._id,
      });
      const allGoalInvestments = await Promise.all(
        goals.map(async (goal) => {
          return await this.GoalsInvestmentModel.find({
            goalId: goal._id,
          });
        })
      );
      const deposits = await this.DepositsModel.find(
        { userId: userInfo._id },
        { userId: false }
      );
      const portfolioDetails = await this.PortfolioDetailsModel.findOne(
        {
          userId: userInfo._id,
        },
        { userId: false, _id: false, __v: false }
      );
      const portfolioHistory = await this.PortfolioHistoryModel.find({
        userId: userInfo._id,
      }).sort({ date: -1 });
      res.json({
        user: userInfo,
        goals: { goals, investments: allGoalInvestments },
        deposits,
        portfolioDetails,
        portfolioHistory,
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: err.message });
    }
  }
}
