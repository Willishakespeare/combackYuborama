import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Payment, { IPayment } from "../models/payment";
import Client from "../models/client";
import Pack from "../models/pack";
import PayTokenModel from "../models/paytoken";
import config from "../config/config";
import { insertAppoiment } from "./appoiments.controllers"
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

export const prePay = async (req: Request, res: Response) => {
  const { data } = req.body;
  if (data) {
    const info = Object.assign(data, { preci: "S80" });
    const newToken = new PayTokenModel({
      data: jwt.sign(info, config.JWTSecret, {
        expiresIn: 86400,
      }),
    });

    const getNewToken = await newToken.save();

    res.status(200).json(getNewToken._id);
  }
};

export const payAccepted = async (req: Request, res: Response) => {
  const { idpay } = req.body;
  if (!idpay) {
    return res.status(200).json({ msg: "send all data" });
  }
  const payTokenModel = await PayTokenModel.findById(idpay)
  if (!payTokenModel) {
    return res.status(200).json({ msg: "payToken no exits" });
  }
  const data: any = jwt.decode(payTokenModel.data)
  if (data) {
    const client = await Client.findById({ _id: data.idclient }).select('name');
    if (client) {
      req.body = {
        name: "New Appoiment",
        hours: data.appoimenttime,
        desc: "Appoiment Description",
        details: "Appoiment Details",
        day: data.day,
        month: data.month,
        year: data.year,
        recomendation: "Appoiment Recomendation",
        doctorid: data.iddoctor,
        clientid: data.idclient
      }
      await Client.updateOne(
        { _id: client.id },
        { $push: { paymentdone: payTokenModel._id } }
      );
      try {
         insertAppoiment(req, res)
      } catch (error) {
        return res.status(200).send(error)
      }
      // return res.status(200).json({ msg: "paso" });
    }
  }
}

export const getPay = async (req: Request, res: Response) => {
  const { idpay } = req.body;
  if (!idpay) {
    return res.status(200).json({ msg: "send all data" });
  }
  const payTokenModel = await PayTokenModel.findById(idpay)
  if (!payTokenModel) {
    return res.status(200).json({ msg: "payToken no exits" });
  }
  return res.status(200).json({ data: jwt.decode(payTokenModel.data) });
}

export const updatePay = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (data && id) {
    const paytoken = await PayTokenModel.findById(id)
    if (paytoken) {
      PayTokenModel.updateOne({ _id: id }, {
        data: jwt.sign(data, config.JWTSecret, {
          expiresIn: 86400,
        })
      }).then(() => {
        res.status(200).json({ msg: "Update payToken" });
      })
        .catch((error) => {
          res.status(400).send(error);
        });
    } else {
      return res.status(400).json({ msg: "id not exist" });
    }
  } else {
    return res.status(400).json({ msg: "send all data please" });
  }
};

export const getPaymentDoneById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data" });
  }
  const clientt = await Client.findById(id)
  if (!clientt) {
    return res.status(400).json({ msg: "client no exits" });
  }
  
  const client = await Client.findById({ _id: id }).select('paymentdone')
    .populate({
      path: "paymentdone",
      select: "-__v",
    })
  if (!client) {
    return res.status(400).json({ msg: "client no exits" });
  }
  const decodedata = client.paymentdone.map((e:any)=>jwt.decode(e.data))
  console.log(client);
  return res.status(200).json({ decodedata: decodedata });
}