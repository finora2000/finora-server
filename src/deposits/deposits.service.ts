import { Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { DepositDto } from "./dto/deposits.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schemas/UserSchema";
import { Model } from "mongoose";
import { Deposits } from "src/schemas/DepositsSchema";
import { Goals } from "src/schemas/GoalSchema";
import { GoalsInvestment } from "src/schemas/GoalInvestmentSchema";
import { PortfolioDetails } from "src/schemas/PortfolioDetailsSchema";
import { PortfolioHistory } from "src/schemas/PortfolioHistorySchema";

@Injectable()
export class DepositsService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Deposits.name)
    private DepositsModel: Model<Deposits>,
    @InjectModel(Goals.name)
    private GoalsModel: Model<Goals>,
    @InjectModel(GoalsInvestment.name)
    private GoalsInvestmentModel: Model<GoalsInvestment>,
    @InjectModel(PortfolioDetails.name)
    private PortfolioDetailsModel: Model<PortfolioDetails>,
    @InjectModel(PortfolioHistory.name)
    private PortfolioHistoryModel: Model<PortfolioHistory>
  ) {}

  async addDeposit(req: Request, res: Response) {
    try {
      const userInfo = req["userInfo"];
      const body = req.body;

      const newDeposit = new this.DepositsModel({
        amount: body.amount,
        name: body.name,
        userId: userInfo._id,
      });
      await newDeposit.save();
      if (body.allocations) await this.allocateFundsToGoals(body.allocations);
      await this.PortfolioDetailsModel.findOneAndUpdate(
        { userId: userInfo["_id"] },
        {
          $inc: {
            savings: body.savings,
            cash: body.cash,
            invested: body.amount - (body.cash + body.savings),
          },
        }
      );
      let currentMonth = new Date().toLocaleString("default", {
        month: "short",
      });
      if (currentMonth === "Jan") currentMonth = `${new Date().getFullYear()}`;
      await this.PortfolioHistoryModel.findOneAndUpdate(
        { userId: userInfo["_id"], month: currentMonth },
        {
          $inc: {
            savings: body.savings,
            cash: body.cash,
            investedAmount: body.amount - (body.cash + body.savings),
            investedReturn: body.amount - (body.cash + body.savings),
          },
        }
      );

      const deposit = newDeposit.toJSON();
      delete deposit["userId"];
      delete deposit["_id"];
      res.json({ msg: "Deposit Successful", deposit });
    } catch (err) {
      res.status(500).json({ msg: err.message, deposit: null });
    }
  }

  private async allocateFundsToGoals(allocations) {
    const goalsIds = Object.entries(allocations);
    goalsIds.forEach(async (goal) => {
      const goalId = goal[0] as string;
      const amount = goal[1] as number;
      console.log("goal", goal);
      const updatedGoal = await this.GoalsModel.findOneAndUpdate(
        { _id: goalId },
        { $inc: { invested: amount } }
      );
      if (updatedGoal) {
        const goalId = updatedGoal.toJSON()._id;
        const goalInvestments = await this.GoalsInvestmentModel.find({
          goalId,
        });
        goalInvestments.forEach(async (inv) => {
          await this.GoalsInvestmentModel.updateOne(
            { _id: inv._id },
            { $inc: { invested: amount * inv.allocation } }
          );
        });
      }
    });
  }
}
