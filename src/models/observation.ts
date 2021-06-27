import { model, Schema, Document, ObjectId } from "mongoose";

export interface Iobservation extends Document {
    observation: string;
    doctorid: ObjectId;
}

const observationSchema: Schema<Iobservation> = new Schema(
    {
        observation: {
            type: String,
            required: true,
        },
        doctorid: { type: Schema.Types.ObjectId, ref: "doctor" },
    },
    { timestamps: true, minimize: false }
);

export default model<Iobservation>("observation", observationSchema);
