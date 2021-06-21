import { model, Schema, Document, ObjectId } from "mongoose";

export interface ISkill extends Document {
  nameSkill: string;
  fileUrl: string;
  status: "validate" | "suspending" | "inprogress";
  userID: ObjectId;
}

const skillSchema: Schema<ISkill> = new Schema(
  {
    nameSkill: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["validate", "suspending", "inprogress"],
      default: "inprogress",
    },
  },
  { timestamps: true, minimize: false }
);

export default model<ISkill>("skill", skillSchema);
