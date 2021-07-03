import { model, Schema, Document, ObjectId } from "mongoose";

export interface IAppoiments extends Document {
  name: string;
  hours: string;
  desc: string;
  details: string;
  day: number;
  month: number;
  year: number;
  urlzoom: string;
  hosturlzoom: string;
  status: "complete" | "incomplete";
  recomendation: string;
  clientid: ObjectId;
  doctorid: ObjectId;
  feedback: ObjectId;
}

const appoimentSchema: Schema<IAppoiments> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    hours: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    urlzoom: { type: String, required: true },
    hosturlzoom: { type: String, required: true },
    status: {
      type: String,
      enum: ["complete", "incomplete"],
      default: "incomplete",
    },
    
    recomendation: { type: String, required: true },
    clientid: { type: Schema.Types.ObjectId, ref: "client" },
    doctorid: { type: Schema.Types.ObjectId, ref: "doctor" },
    feedback: { type: Schema.Types.ObjectId, ref: "feedback" },
  },
  { timestamps: true, minimize: false }
);

export default model<IAppoiments>("appoiment", appoimentSchema);
