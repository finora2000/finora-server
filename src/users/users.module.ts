import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/UserSchema";
import {
  PortfolioDetails,
  PortfolioDetailsSchema,
} from "src/schemas/PortfolioDetailsSchema";
import {
  PortfolioHistory,
  PortfolioHistorySchema,
} from "src/schemas/PortfolioHistorySchema";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PortfolioDetails.name, schema: PortfolioDetailsSchema },
      { name: PortfolioHistory.name, schema: PortfolioHistorySchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: "/api/users/userInfo", method: RequestMethod.GET });
  }
}
