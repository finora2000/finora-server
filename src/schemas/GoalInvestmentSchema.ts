import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";

export type GoalsInvestmentDocument = HydratedDocument<GoalsInvestment>;

@Schema()
export class GoalsInvestment {
  @Prop({ required: true })
  goalId: string;

  @Prop({ required: true })
  tickerName: string;

  @Prop({ default: "" })
  tickerLogo: string;

  @Prop({ default: 0 })
  invested: number;

  @Prop({ default: 0 })
  returns: number;

  @Prop({ default: 0 })
  totalInterestGained: number;

  @Prop({ default: 0 })
  dayChange: number;

  @Prop({ default: 0 })
  todaysGain: number;

  @Prop({ default: 0 })
  allocation: number;
}

export const GoalsInvestmentSchema =
  SchemaFactory.createForClass(GoalsInvestment);
