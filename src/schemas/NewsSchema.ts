import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as ss } from "mongoose";

export type NewsDocument = HydratedDocument<News>;

@Schema()
export class News {
  @Prop({ default: null })
  title: string;

  @Prop({ default: "" })
  link: string;

  @Prop({ default: "" })
  source: string;

  @Prop({ default: "" })
  pubDate: string;
}

export const NewsSchema = SchemaFactory.createForClass(News);
