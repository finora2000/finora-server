import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import { GoalsInvestment } from "src/schemas/GoalInvestmentSchema";
import { Goals } from "src/schemas/GoalSchema";
import { News } from "src/schemas/NewsSchema";
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
    private GoalsInvestmentModel: Model<GoalsInvestment>,
    @InjectModel(News.name)
    private NewsModel: Model<News>
  ) {}

  onModuleInit() {
    this.handleMonthlyCron();
    this.handleDailyCron();
  }

  @Cron(CronExpression.EVERY_WEEKDAY)
  async handleDailyCron() {
    this.updateStockPrices();
    this.getLatestNews();
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyCron() {
    const allUserIds = await this.UserModel.find({}, { _id: true });
    let currentMonth = new Date().toLocaleString("default", {
      month: "short",
    });
    if (currentMonth === "Jan") currentMonth = `${new Date().getFullYear()}`;

    const recordExists = await this.PortfolioHistoryModel.findOne({
      month: currentMonth,
    });
    if (recordExists) return;
    for (let index in allUserIds) {
      const userId = allUserIds[index]._id.toString();
      const latestPortfolioMonth = await this.PortfolioHistoryModel.findOne({
        userId,
      });
      if (
        new Date(latestPortfolioMonth.datetime).getMonth() <
        new Date().getMonth()
      ) {
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

  async updateStockPrices() {
    const distinctTickerNames = await this.GoalsInvestmentModel.distinct(
      "tickerName"
    );

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
      } catch (err) {
        console.log(err);
      }
    }
    const updatedGoalInvestments = await this.GoalsInvestmentModel.find();
    const allUserIds = await this.UserModel.find({}, { _id: true });

    let totalPortfolioReturns = 0;
    for (let index in allUserIds) {
      const userId = allUserIds[index]._id;
      const userGoals = await this.GoalsModel.find({ userId });
      for (let goalIndex in userGoals) {
        const { _id, returns, totalInterestGained } =
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

  async getLatestNews() {
    await this.NewsModel.deleteMany({});
    const url = "https://yahoo-finance15.p.rapidapi.com/api/yahoo/ne/news";
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      const top7News = result.slice(0, 7);
      await this.NewsModel.insertMany(top7News);
    } catch (error) {
      console.error(error);
    }
  }
}
