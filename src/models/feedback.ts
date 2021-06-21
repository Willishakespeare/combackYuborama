import { model, Schema, Document } from "mongoose";

export interface IFeedBack extends Document {
  feedback: string;
  comment: string;
  rate: string;
}

const feedbackSchema: Schema<IFeedBack> = new Schema(
  {
    feedback: {
      type: String,
      default: "",
    },
    comment: {
      type: String,
      default: "",
    },
    rate: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true, minimize: false }
);

export default model<IFeedBack>("feedback", feedbackSchema);
