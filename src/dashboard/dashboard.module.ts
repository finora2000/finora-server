import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/UserSchema";
import { Deposits, DepositsSchema } from "src/schemas/DepositsSchema";
import { Goals, GoalsSchema } from "src/schemas/GoalSchema";
import {
  GoalsInvestment,
  GoalsInvestmentSchema,
} from "src/schemas/GoalInvestmentSchema";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { MiddlewareConsumer } from "@nestjs/common/interfaces";
import {
  PortfolioDetails,
  PortfolioDetailsSchema,
} from "src/schemas/PortfolioDetailsSchema";
import {
  PortfolioHistory,
  PortfolioHistorySchema,
} from "src/schemas/PortfolioHistorySchema";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Deposits.name, schema: DepositsSchema },
      { name: Goals.name, schema: GoalsSchema },
      { name: GoalsInvestment.name, schema: GoalsInvestmentSchema },
      { name: PortfolioDetails.name, schema: PortfolioDetailsSchema },
      { name: PortfolioHistory.name, schema: PortfolioHistorySchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(DashboardController);
  }
}
