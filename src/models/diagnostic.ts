import { model, Schema, Document, ObjectId } from "mongoose";

export interface IDiagnostic extends Document {
  diagnostic: string;
  condition: number;
  recomendation: string;
}

const diagnosticSchema: Schema<IDiagnostic> = new Schema(
  {
    diagnostic: {
      type: String,
      default: "",
    },
    condition: {
      type: Number,
      default: 5,
    },
    recomendation: { type: String, default: "" },
  },
  { timestamps: true, minimize: false }
);

export default model<IDiagnostic>("diagnostic", diagnosticSchema);
