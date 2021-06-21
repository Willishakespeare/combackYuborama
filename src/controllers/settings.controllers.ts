import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Settings from "../models/settings";
import config from "../config/config";

export const updateSettings = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const newSettings = await Settings.findById({ _id: id });
    if (!newSettings) {
      return res.status(400).json({ msg: "The Skill not exists" });
    } else {
      await Settings.updateOne({ _id: id }, { jsonSettings: data })
        .then(() => {
          return res.status(200).json({ msg: "Data Updated" });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err });
        });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const deleteSettings = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newSettings = await Settings.findById({ _id: id });
      if (!newSettings) {
        return res.status(400).json({ msg: "The Skill not exists" });
      } else {
        await Settings.deleteOne({ _id: id })
          .then(() => {
            return res.status(200).json({ msg: "Data Deleted" });
          })
          .catch((err) => {
            return res.status(400).json({ msg: err });
          });
      }
    } catch (error) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);
  if (auth.role === "admin") {
    try {
      await Settings.find()
        .then((data) => {
          return res.status(200).json(data);
        })
        .catch((err) => {
          return res.status(400).json({ msg: err });
        });
    } catch (error) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const getSettingsById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newSettings = await Settings.findById({ _id: id });
      if (newSettings) {
        return res.status(200).json(newSettings);
      } else {
        return res.status(400).json({ msg: "The Payment not exists" });
      }
    } catch (error) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const getSettingsByUserId = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const newSettings = await Settings.findOne({ userID: id });
    if (newSettings) {
      return res.status(200).json(newSettings);
    } else {
      return res.status(400).json({ msg: "The Payment not exists" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};
