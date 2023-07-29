import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type DepositsDocument = HydratedDocument<Deposits>;

@Schema()
export class Deposits {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    unique: true,
    default: () => {
      let id = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const length = 10;

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
      }

      return "finora-" + id;
    },
  })
  id: string;

  @Prop({ default: new Date().toJSON() })
  date: string;
}

export const DepositsSchema = SchemaFactory.createForClass(Deposits);
