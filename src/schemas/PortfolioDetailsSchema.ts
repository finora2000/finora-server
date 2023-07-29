import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<PortfolioDetails>;

@Schema()
export class PortfolioDetails {
  @Prop({ required: true, default: 0 })
  userId: string;

  @Prop({ required: true, default: 0 })
  savings: number;

  @Prop({ required: true, default: 0 })
  cash: number;

  @Prop({ required: true, default: 0 })
  invested: number;
}

export const PortfolioDetailsSchema =
  SchemaFactory.createForClass(PortfolioDetails);
