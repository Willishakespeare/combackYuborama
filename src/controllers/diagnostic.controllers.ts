import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Diagnostic, { IDiagnostic } from "../models/diagnostic";
import Client from "../models/client";
import Doctor from "../models/doctor";
import config from "../config/config";

export const insertDiagnostic = async (req: Request, res: Response) => {
  const { doctorid, clientid, diagnostic, condition, recomendation } = req.body;
  if (!doctorid || !clientid || !diagnostic || !condition || !recomendation) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const doctor = await Doctor.findOne({
      _id: doctorid,
    });
    if (doctor) {
      const client = await Client.findOne({
        _id: clientid,
      });
      if (client) {
        const newDiagnostic = new Diagnostic(req.body);
        await Client.updateOne(
          { _id: clientid },
          { $push: { diagnostics: newDiagnostic._id } }
        );
        await Doctor.updateOne(
          { _id: doctorid },
          { $push: { diagnostics: newDiagnostic._id } }
        );
        await newDiagnostic.save();

        return res.status(200).json({ msg: "Diagnostic registered" });
      } else {
        return res.status(400).json({ msg: "not client available" });
      }
    } else {
      return res.status(400).json({ msg: "not professional available" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const updateDiagnostic = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const diagnosticGet = await Diagnostic.findById({ _id: id });
      if (!diagnosticGet) {
        return res.status(400).json({ msg: "The Diagnostic not exists" });
      } else {
        Diagnostic.updateOne({ _id: id }, data)
          .then(() => {
            return res.status(200).json({ msg: "Data Updated" });
          })
          .catch((err) => {
            return res.status(400).json({ msg: err });
          });
      }
    } catch (error: any) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const deleteDiagnostic = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const diagnosticGet = await Diagnostic.findById({ _id: id });
      if (!diagnosticGet) {
        return res.status(400).json({ msg: "The Diagnostic not exists" });
      } else {
        Diagnostic.deleteOne({ _id: id })
          .then(() => {
            return res.status(200).json({ msg: "Data Deleted" });
          })
          .catch((err) => {
            return res.status(400).json({ msg: err });
          });
      }
    } catch (error: any) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const getDiagnostics = async (req: Request, res: Response) => {
  try {
    Diagnostic.find()
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(400).json({ msg: err });
      });
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const getDiagnosticById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const diagnosticGet = await Diagnostic.findById({ _id: id });
    if (diagnosticGet) {
      return res.status(200).json(diagnosticGet);
    } else {
      return res.status(400).json({ msg: "The Diagnostic not exists" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};
