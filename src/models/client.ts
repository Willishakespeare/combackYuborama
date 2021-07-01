import { model, Schema, Document, ObjectId } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "./user";

export interface IClient extends Document, IUser {
  payment: ObjectId;
  pack: ObjectId;
  condition: ObjectId;
  appoiments: [ObjectId];
  diagnostics: [ObjectId];
  observations: [ObjectId];
}

const clientSchema: Schema<IClient> = new Schema(
  {
    settings: {
      type: Schema.Types.ObjectId,
      ref: "setting",
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      default: "",
    },
    lastname: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "client",
    },
    gdate: {
      type: Date,
      default: Date.now(),
    },
    gener: {
      type: String,
      enum: ["fmale", "male"],
      default: "fmale",
    },
    language: {
      type: String,
      default: "EN",
    },
    cellphone: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    documentidentity: {
      type: String,
      default: "",
    },
    medicalid: {
      type: String,
      default: "",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    photoid: {
      type: String,
      default:
        "https://www.tenforums.com/attachments/tutorials/146359d1501443008-change-default-account-picture-windows-10-a-user.png",
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "payment",
    },
    pack: {
      type: Schema.Types.ObjectId,
      ref: "pack",
    },
    condition: [
      {
        type: Schema.Types.ObjectId,
        ref: "condition",
      },
    ],
    appoiments: [
      {
        type: Schema.Types.ObjectId,
        ref: "appoiment",
      },
    ],
    diagnostics: [
      {
        type: Schema.Types.ObjectId,
        ref: "diagnostic",
      },
    ],
    observations: [
      {
        type: Schema.Types.ObjectId,
        ref: "observation",
      },
    ],
  },
  { timestamps: true, minimize: false }
);

clientSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

clientSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default model<IClient>("client", clientSchema);
