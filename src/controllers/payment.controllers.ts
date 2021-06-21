import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Payment, { IPayment } from "../models/payment";
import Client from "../models/client";
import Pack from "../models/pack";
import config from "../config/config";

export const pay = async (req: Request, res: Response) => {
  const { card, cardout, typepayment, paypal, idclient, namepack } = req.body;
  if (!typepayment || !idclient || !namepack) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const client = await Client.findOne({
      _id: idclient,
    });
    if (client) {
      const pack = await Pack.findOne({
        idpack: namepack,
      });
      if (pack) {
        const newPayment = new Payment({
          card,
          cardout,
          typepayment,
          paypal,
        });
        await Client.updateOne(
          { _id: client._id },
          {
            pack: pack._id,
            payment: newPayment._id,
          }
        );
        await newPayment.save();

        return res.status(200).json({ msg: "Payment registered" });
      } else {
        return res.status(400).json({ msg: "not pack available" });
      }
    } else {
      return res.status(400).json({ msg: "not client available" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newPayment = await Payment.findById({ _id: id });
      if (!newPayment) {
        return res.status(400).json({ msg: "The Payment not exists" });
      } else {
        Payment.updateOne({ _id: id }, data)
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
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newPayment = await Payment.findById({ _id: id });
      if (!newPayment) {
        return res.status(400).json({ msg: "The Payment not exists" });
      } else {
        Payment.deleteOne({ _id: id })
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

export const getPayments = async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);
  if (auth.role === "admin") {
    try {
      Payment.find()
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

export const getPaymentById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newPayment = await Payment.findById({ _id: id });
      if (newPayment) {
        return res.status(200).json(newPayment);
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
