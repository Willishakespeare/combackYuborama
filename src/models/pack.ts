import { model, Schema, Document } from "mongoose";

export interface IPack extends Document {
  id: string;
  namepack: string;
  descpack: string;
  price: number;
  idpack: number;
  currency: string;
}

const packSchema: Schema<IPack> = new Schema(
  {
    namepack: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    idpack: {
      type: Number,
      unique: true,
      required: true,
    },
    descpack: {
      type: [],
      required: true,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true, minimize: false }
);

export default model<IPack>("pack", packSchema);
