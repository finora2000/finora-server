import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request, Response } from "express";
import { Model } from "mongoose";
import { Deposits } from "src/schemas/DepositsSchema";
import { GoalsInvestment } from "src/schemas/GoalInvestmentSchema";
import { Goals } from "src/schemas/GoalSchema";
import { User } from "src/schemas/UserSchema";

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Deposits.name)
    private DepositsModel: Model<Deposits>,
    @InjectModel(Goals.name)
    private GoalsModel: Model<Goals>,
    @InjectModel(GoalsInvestment.name)
    private GoalsInvestmentModel: Model<GoalsInvestment>
  ) {}

  async create(req: Request, res: Response) {
    const { name, target, priority, duration, tickersAllocation } = req.body;
    const userInfo = req["userInfo"];
    const newGoal = new this.GoalsModel({
      name,
      target,
      priority,
      duration,
      userId: userInfo._id,
    });

    console.log("newGoal", newGoal);
    const tickers = Object.entries(tickersAllocation);
    const investments = tickers.map((i: [string, number]) => {
      const tickerName = i[0];
      const allocation = i[1];
      const newGoalInvestment = new this.GoalsInvestmentModel({
        allocation: +(allocation / 100),
        tickerName,
        goalId: newGoal._id,
      });
      // newGoal.investments.push(newGoalInvestment);
      return newGoalInvestment.save();
    });
    await newGoal.save();

    const allInvestments = (await Promise.allSettled(investments)).map(
      // @ts-ignore
      (i) => i.value
    );
    res.json({ investments: allInvestments, goal: newGoal });
  }
}
