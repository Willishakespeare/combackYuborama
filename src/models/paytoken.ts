import { model, Schema, Document, ObjectId } from "mongoose";

export interface IAppoiments extends Document {
  data: any;
  idToken: number;
}

const paytokenSchema: Schema<IAppoiments> = new Schema(
  {
    data: {
      type: Object,
      required: true,
    },
    _id: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, minimize: false, _id: false }
);

paytokenSchema.pre("save", async function (next) {
  try {
    const payTokenModel = model<IAppoiments>("paytoken", paytokenSchema);
    var doc = this;
    const lastToken = await payTokenModel
      .find({}, {}, { sort: { created_at: 1 } })
      .catch((err) => next());
    if (lastToken) {
      doc._id = lastToken[lastToken.length - 1]._id + 1;
      next();
    }
  } catch (error) {
    next();
  }
});

const payTokenModel = model<IAppoiments>("paytoken", paytokenSchema);

export default payTokenModel;
