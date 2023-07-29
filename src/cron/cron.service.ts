import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import { GoalsInvestment } from "src/schemas/GoalInvestmentSchema";
import { Goals } from "src/schemas/GoalSchema";
import { PortfolioDetails } from "src/schemas/PortfolioDetailsSchema";
import { PortfolioHistory } from "src/schemas/PortfolioHistorySchema";
import { User } from "src/schemas/UserSchema";

@Injectable()
export class CronService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    // @InjectModel(Deposits.name) private DepositsModel: Model<Deposits>,
    @InjectModel(Goals.name) private GoalsModel: Model<Goals>,
    @InjectModel(PortfolioDetails.name)
    private PortfolioDetailsModel: Model<PortfolioDetails>,
    @InjectModel(PortfolioHistory.name)
    private PortfolioHistoryModel: Model<PortfolioHistory>,
    @InjectModel(GoalsInvestment.name)
    private GoalsInvestmentModel: Model<GoalsInvestment>
  ) {}

  onModuleInit() {
    this.handleMonthlyCron();
    this.handleDailyCron();
  }

  @Cron(CronExpression.EVERY_WEEKDAY)
  async handleDailyCron() {
    const distinctTickerNames = await this.GoalsInvestmentModel.distinct(
      "tickerName"
    );
    // this.PortfolioHistoryModel.find()
    for (let index in distinctTickerNames) {
      try {
        const tickerName = distinctTickerNames[index];

        const url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-financials?symbol=${tickerName}&region=US`;
        const options = {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
          },
        };

        const response = await fetch(url, options);
        const result = await response.json();
        let currentPrice = result.price.regularMarketPrice.raw;
        let dayChange = result.price.regularMarketChange.raw;
        let dayChangePercent = result.price.regularMarketChangePercent.raw;
        console.log({ currentPrice, dayChange, dayChangePercent });
        await this.GoalsInvestmentModel.updateMany(
          { tickerName },
          {
            $inc: {
              returns: dayChange,
              totalInterestGained: dayChange,
            },
            $set: {
              dayChange: dayChangePercent,
              todaysGain: dayChange,
            },
          },
          { multi: true }
        );

        // let apiRoute = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${tickerName}&apikey=${process.env.APLHA_VINTAGE_API_KEY}`;
        // const res = await fetch(apiRoute);
        // console.log("res.status", res.status);
        // const currentStockData = await res.json();
        // console.log("currentStockData", currentStockData);
        // const currentPrice = +currentStockData["Global Quote"]["05. price"];
        // const dayChange = +currentStockData["Global Quote"]["09. change"];
        // const dayChangePercent =
        //   +`${currentStockData["Global Quote"]["10. change percent"]}`.replace(
        //     "%",
        //     ""
        //   );
        // await this.GoalsInvestmentModel.updateMany(
        //   { tickerName },
        //   {
        //     $inc: { returns: dayChange, totalInterestGained: dayChange },
        //     $set: { dayChange: dayChangePercent, todaysGain: dayChange },
        //   }
        // );
        // });
      } catch (err) {
        console.log(err);
      }
    }
    const updatedGoalInvestments = await this.GoalsInvestmentModel.find();
    const allUserIds = await this.UserModel.find({}, { _id: true });
    // console.log("allUserIds", allUserIds);
    let totalPortfolioReturns = 0;
    for (let index in allUserIds) {
      const userId = allUserIds[index]._id;
      const userGoals = await this.GoalsModel.find({ userId });
      for (let goalIndex in userGoals) {
        const { _id, dayChange, returns, todaysGain, totalInterestGained } =
          userGoals[goalIndex].toJSON();
        const aggregatedChanges = {
          dayChange: [] as any,
          todaysGain: [] as any,
          returns,
          totalInterestGained: [totalInterestGained] as any,
        };
        updatedGoalInvestments.forEach((i) => {
          if (i.goalId === `${_id}`) {
            aggregatedChanges.returns += i.todaysGain || 0;
            aggregatedChanges.totalInterestGained = [
              ...aggregatedChanges.totalInterestGained,
              i.totalInterestGained || 0,
            ];
            aggregatedChanges.todaysGain = [
              ...aggregatedChanges.todaysGain,
              i.todaysGain || 0,
            ];
            aggregatedChanges.dayChange = [
              ...aggregatedChanges.dayChange,
              i.dayChange || 0,
            ];
          }
        });
        aggregatedChanges.dayChange =
          aggregatedChanges.dayChange.reduce((acc, curr) => {
            return acc + curr;
          }, 0) / aggregatedChanges.dayChange.length || 0;

        aggregatedChanges.todaysGain =
          aggregatedChanges.todaysGain.reduce((acc, curr) => {
            return acc + curr;
          }, 0) / aggregatedChanges.todaysGain.length || 0;

        aggregatedChanges.totalInterestGained =
          aggregatedChanges.totalInterestGained.reduce((acc, curr) => {
            return acc + curr;
          }, 0) / aggregatedChanges.totalInterestGained.length || 0;
        totalPortfolioReturns += aggregatedChanges.returns;
        await this.GoalsModel.updateOne(
          { _id },
          {
            $set: {
              returns: aggregatedChanges.returns,
              totalInterestGained: aggregatedChanges.totalInterestGained,
              dayChange: aggregatedChanges.dayChange,
              todaysGain: aggregatedChanges.todaysGain,
            },
          }
        );

        //     // goal.dayChange
      }
      let currentMonth = new Date().toLocaleString("default", {
        month: "short",
      });
      if (currentMonth === "Jan") currentMonth = `${new Date().getFullYear()}`;
      await this.PortfolioHistoryModel.updateOne(
        { month: currentMonth },
        { $inc: { investedReturn: totalPortfolioReturns } }
      );
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyCron() {
    const allUserIds = await this.UserModel.find({}, { _id: true });
    for (let index in allUserIds) {
      const userId = allUserIds[index]._id.toString();
      const latestPortfolioMonth = await this.PortfolioHistoryModel.findOne({
        userId,
      });
      if (
        new Date(latestPortfolioMonth.datetime).getMonth() <
        new Date().getMonth()
      ) {
        let currentMonth = new Date().toLocaleString("default", {
          month: "short",
        });
        if (currentMonth === "Jan")
          currentMonth = `${new Date().getFullYear()}`;
        const newPortfolioMonth = new this.PortfolioHistoryModel({
          cash: latestPortfolioMonth.cash,
          savings: latestPortfolioMonth.savings,
          investedAmount: latestPortfolioMonth.investedAmount,
          investedReturn: latestPortfolioMonth.investedReturn,
          userId,
          month: currentMonth,
          datetime: new Date(),
        });
        await newPortfolioMonth.save();
      }
    }
    console.log("Cron job executed on the 1st day of the month.");
  }
}
