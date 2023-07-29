import { MiddlewareConsumer, Module } from "@nestjs/common";
import { DepositsService } from "./deposits.service";
import { DepositsController } from "./deposits.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/UserSchema";
import { Deposits, DepositsSchema } from "src/schemas/DepositsSchema";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { Goals, GoalsSchema } from "src/schemas/GoalSchema";
import { GoalsInvestment, GoalsInvestmentSchema } from "src/schemas/GoalInvestmentSchema";
import { PortfolioDetails, PortfolioDetailsSchema } from "src/schemas/PortfolioDetailsSchema";
import { PortfolioHistory, PortfolioHistorySchema } from "src/schemas/PortfolioHistorySchema";

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
  controllers: [DepositsController],
  providers: [DepositsService],
})
export class DepositsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(DepositsController);
  }
}
