import { model, Schema, Document } from "mongoose";

export interface IPayment extends Document {
  card: string;
  cardout: string;
  typepayment: string;
  paypal: string;
  status: "active" | "inactive";
}

const paymentSchema: Schema<IPayment> = new Schema(
  {
    card: {
      type: String,
      default: "",
    },
    cardout: {
      type: String,
      default: "",
    },
    typepayment: {
      type: String,
      default: "",
    },
    paypal: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true, minimize: false }
);

export default model<IPayment>("payment", paymentSchema);
