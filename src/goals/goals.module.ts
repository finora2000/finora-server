import { MiddlewareConsumer, Module } from "@nestjs/common";
import { GoalsService } from "./goals.service";
import { GoalsController } from "./goals.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/UserSchema";
import { Deposits, DepositsSchema } from "src/schemas/DepositsSchema";
import { Goals, GoalsSchema } from "src/schemas/GoalSchema";
import {
  GoalsInvestment,
  GoalsInvestmentSchema,
} from "src/schemas/GoalInvestmentSchema";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Deposits.name, schema: DepositsSchema },
      { name: Goals.name, schema: GoalsSchema },
      { name: GoalsInvestment.name, schema: GoalsInvestmentSchema },
    ]),
  ],
  controllers: [GoalsController],
  providers: [GoalsService],
})
export class GoalsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(GoalsController);
  }
}
