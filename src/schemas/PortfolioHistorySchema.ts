import { Prop, Schema, SchemaFactory, ModelDefinition } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type PortfolioHistoryDocument = HydratedDocument<PortfolioHistory>;

@Schema()
export class PortfolioHistory {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: 0 })
  savings: number;

  @Prop({ default: 0 })
  cash: number;

  @Prop({ default: 0 })
  investedAmount: number;

  @Prop({ default: 0 })
  investedReturn: number;

  @Prop({
    default: () => {
      let currentMonth = new Date().toLocaleString("default", {
        month: "short",
      });
      if (currentMonth === "Jan") currentMonth = `${new Date().getFullYear()}`;
      return currentMonth;
    },
  })
  month: string;

  @Prop({ default: new Date().toJSON() })
  datetime: string;
}

export const PortfolioHistorySchema =
  SchemaFactory.createForClass(PortfolioHistory);
