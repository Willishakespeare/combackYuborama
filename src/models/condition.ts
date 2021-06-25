import { model, Schema, Document, ObjectId } from "mongoose";

export interface ICondition extends Document {
  namecondition: string;
  typecondition: string;
  userid: ObjectId;
}

const conditionSchema: Schema<ICondition> = new Schema(
  {
    namecondition: {
      type: String,
      required: true,
    },
    typecondition: {
      type: String, enum: ['Allergie', 'Illnesses'],
      required: true,
    }
  },
  { timestamps: true, minimize: false }
);

export default model<ICondition>("condition", conditionSchema);
