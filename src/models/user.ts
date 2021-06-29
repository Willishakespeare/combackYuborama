import { model, Schema, Document, ObjectId } from "mongoose";
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name: string;
  lastname: string;
  role: "client" | "doctor" | "admin";
  gdate: Date;
  gener: "fmale" | "male";
  language: string;
  cellphone: string;
  phone: string;
  documentidentity: string;
  medicalid: string;
  verify: boolean;
  photoid: string;
  settings: ObjectId;
  comparePassword: (e: string) => Promise<boolean>;
}
