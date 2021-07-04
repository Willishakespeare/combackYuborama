import { model, Schema, Document, ObjectId } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "./user";

export interface IDoctor extends Document, IUser {
  speciality: string;
  noex: string;
  whatsapp: string;
  honorarium: string;
  descprofile: string;
  availability: boolean[][];
  skills: [ObjectId];
  appoiments: [ObjectId];
  diagnostics: [ObjectId];
}

const doctorSchema: Schema<IDoctor> = new Schema(
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
    subscription: {
      type: Object,
      default: {},
    },
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "doctor",
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
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    documentidentity: {
      type: String,
      required: true,
    },
    medicalid: {
      type: String,
      required: true,
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

    speciality: {
      type: String,
      required: true,
    },
    noex: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    honorarium: {
      type: String,
      required: true,
    },
    descprofile: {
      type: String,
      required: true,
    },
    availability: [[{ type: Boolean, require: true }]],
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: "skill",
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
  },
  { timestamps: true, minimize: false }
);

doctorSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

doctorSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default model<IDoctor>("doctor", doctorSchema);
