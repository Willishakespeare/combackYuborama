import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Condition, { ICondition } from "../models/condition";
import Client from "../models/client";
import config from "../config/config";

export const insertCondition = async (req: Request, res: Response) => {
  const { namecondition, typecondition, userid }: ICondition = req.body;
  if (!namecondition || !typecondition || !userid) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const client = await Client.findOne({
      _id: userid,
    });
    if (client) {
      const newCondition = new Condition(req.body);
      await Client.updateOne({ _id: userid }, { $push: { condition: newCondition._id } });
      await newCondition.save();

      return res.status(200).json({ msg: "Condition registered" });
    } else {
      return res.status(400).json({ msg: "not client available" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const updateCondition = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newCondition = await Condition.findById({ _id: id });
      if (!newCondition) {
        return res.status(400).json({ msg: "The Condition not exists" });
      } else {
        Condition.updateOne({ _id: id }, data)
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

export const deleteCondition = async (req: Request, res: Response) => {
  const { id, userid } = req.body;
  if (!id || !userid) {
    return res.status(400).json({ msg: "send all data please" });
  }
  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);
  if (auth.role === "admin") {
    try {
      const client = await Client.findOne({
        _id: userid,
      });
      console.log(client);
      if (client) {
        const newCondition = await Condition.findById({ _id: id });
        if (!newCondition) {
          return res.status(400).json({ msg: "The Condition not exists" });
        } else {
          await Client.updateOne({ _id: userid }, { $pull: { condition: newCondition._id } });
          Condition.deleteOne({ _id: id })
            .then(() => {
              return res.status(200).json({ msg: "Data Deleted" });
            })
            .catch((err) => {
              return res.status(400).json({ msg: err });
            });
        }
      } else {
        return res.status(400).json({ msg: "not client available" });
      }
    } catch (error: any) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const getConditions = async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);
  if (auth.role === "admin") {
    try {
      Condition.find()
        .then((data) => {
          return res.status(200).json(data);
        })
        .catch((err) => {
          return res.status(400).json({ msg: err });
        });
    } catch (error: any) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const getConditionById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newCondition = await Condition.findById({ _id: id });
      if (newCondition) {
        return res.status(200).json(newCondition);
      } else {
        return res.status(400).json({ msg: "The Condition not exists" });
      }
    } catch (error: any) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const getConditionByUserId = async (req: Request, res: Response) => {
  const { userID } = req.body;
  if (!userID) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newCondition = await Condition.findOne({ userID });
      if (newCondition) {
        return res.status(200).json(newCondition);
      } else {
        return res.status(400).json({ msg: "The user dont have Conditions" });
      }
    } catch (error: any) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};
