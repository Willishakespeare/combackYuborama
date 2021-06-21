import { model, Schema, Document, ObjectId } from "mongoose";

export interface ISettings extends Document {
  jsonSettings: Object;
  userID: ObjectId;
}

const paymentSchema: Schema<ISettings> = new Schema(
  {
    jsonSettings: {
      type: Object,
      default: {},
    },
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true, minimize: false }
);

export default model<ISettings>("setting", paymentSchema);
