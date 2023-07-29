import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { DepositsModule } from "./deposits/deposits.module";
import { GoalsModule } from "./goals/goals.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { User, UserSchema } from "./schemas/UserSchema";
import {
  PortfolioDetails,
  PortfolioDetailsSchema,
} from "./schemas/PortfolioDetailsSchema";
import {
  PortfolioHistory,
  PortfolioHistorySchema,
} from "./schemas/PortfolioHistorySchema";
import { Deposits, DepositsSchema } from "./schemas/DepositsSchema";
import { Goals, GoalsSchema } from "./schemas/GoalSchema";
import {
  GoalsInvestment,
  GoalsInvestmentSchema,
} from "./schemas/GoalInvestmentSchema";
import { ScheduleModule } from "@nestjs/schedule";
import { CronService } from './cron/cron.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UsersModule,
    DepositsModule,
    GoalsModule,
    DashboardModule,
    MongooseModule.forRoot(process.env.MONGO_CONN_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PortfolioDetails.name, schema: PortfolioDetailsSchema },
      { name: PortfolioHistory.name, schema: PortfolioHistorySchema },
      { name: Deposits.name, schema: DepositsSchema },
      { name: Goals.name, schema: GoalsSchema },
      { name: GoalsInvestment.name, schema: GoalsInvestmentSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}
