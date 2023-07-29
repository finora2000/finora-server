import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as ss } from "mongoose";
import { GoalsInvestment } from "./GoalInvestmentSchema";

export type GoalsDocument = HydratedDocument<Goals>;

@Schema()
export class Goals {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  priority: string;

  @Prop({ required: true })
  target: number;

  @Prop({ default: 0 })
  invested: number;

  @Prop({ default: 0 })
  returns: number;

  @Prop({ required: true })
  duration: string;

  @Prop({ default: 0 })
  totalInterestGained: number;

  @Prop({ default: 0 })
  dayChange: number;

  @Prop({ default: 0 })
  todaysGain: number;

  @Prop({ required: true, default: new Date().toJSON() })
  startDate: string;

  @Prop({ default: null })
  endDate: Date | null;
}

export const GoalsSchema = SchemaFactory.createForClass(Goals);
