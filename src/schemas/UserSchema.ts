import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import {
  PortfolioHistory,
  PortfolioHistorySchema,
} from "./PortfolioHistorySchema";
import {
  PortfolioDetails,
  PortfolioDetailsSchema,
} from "./PortfolioDetailsSchema";
const bcrypt = require("bcryptjs");

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  // @Prop({
  //   type: PortfolioDetails,
  //   autoCreate: true,
  // })
  // portfolioDetails: PortfolioDetails;

  // @Prop({
  //   type: PortfolioHistory,
  //   autoCreate: true,
  // })
  // PortfolioHistory: PortfolioHistory;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
  next();
});
