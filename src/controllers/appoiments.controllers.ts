import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Appoiment, { IAppoiments } from "../models/appoiment";
import Client from "../models/client";
import Doctor from "../models/doctor";
import Feedback from "../models/feedback";
import config from "../config/config";
import nodemailer from "nodemailer";
import TemplateEmail from "./emailApoiments";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "comebackappemail@gmail.com",
    pass: "Comeback12345.",
  },
});

const mailer = (token: string, email: string) => {
  const messageSend = {
    from: "comebackappemail@gmail.com",
    to: email,
    subject: `New Appoiment`,
    html: token,
    replyTo: "comebackappemail@gmail.com",
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(messageSend, (error, info) =>
      error ? reject(error) : resolve(info)
    );
  });
};

export const insertAppoiment = async (req: Request, res: Response) => {
  const {
    name,
    hours,
    desc,
    details,
    day,
    month,
    year,
    recomendation,
    doctorid,
    clientid,
  } = req.body;
  if (
    !name ||
    !hours ||
    !desc ||
    !details ||
    !day ||
    !month ||
    !year ||
    !recomendation ||
    !doctorid ||
    !clientid
  ) {
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
        const newAppoiment = new Appoiment({
          name,
          hours,
          desc,
          details,
          day,
          month,
          year,
          urlzoom: "http://",
          recomendation,
          doctorid,
          clientid,
        });
        await Client.updateOne(
          { _id: clientid },
          { $push: { appoiments: newAppoiment._id } }
        );
        await Doctor.updateOne(
          { _id: doctorid },
          { $push: { appoiments: newAppoiment._id } }
        );
        newAppoiment.save();
        await mailer(TemplateEmail(doctor.name), doctor.email);
        await mailer(TemplateEmail(client.name), client.email);
        return res.status(200).json(newAppoiment._id);
      } else {
        return res.status(400).json({ msg: "not client available" });
      }
    } else {
      return res.status(400).json({ msg: "not professional available" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

export const updateAppoiment = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  try {
    const appoimentGet = await Appoiment.findById({ _id: id });
    if (!appoimentGet) {
      return res.status(400).json({ msg: "The Appoiment not exists" });
    } else {
      if (data.hour) {
        data.hour = new Date(data.hour);
      }

      Appoiment.updateOne({ _id: id }, data)
        .then(() => {
          return res.status(200).json({ msg: "Appoiment Updated" });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err });
        });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const deleteAppoiment = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const appoimentGet = await Appoiment.findById({ _id: id });
      if (!appoimentGet) {
        return res.status(400).json({ msg: "The Appoiment not exists" });
      } else {
        Appoiment.deleteOne({ _id: id })
          .then(() => {
            Feedback.deleteOne({ _id: appoimentGet.feedback })
              .then(() => {
                return res.status(200).json({ msg: "Appoiment Deleted" });
              })
              .catch((err) => {
                return res.status(400).json({ msg: err });
              });
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

export const getAppoiments = async (req: Request, res: Response) => {
  try {
    Appoiment.find()
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(400).json({ msg: err });
      });
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const getAppoimentById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const packGet = await Appoiment.findById({ _id: id })
      .populate({
        path: "doctorid",
        select: "-__v",
      })
      .populate({
        path: "clientid",
        select: "-__v",
      })
      .populate({
        path: "feedback",
        select: "-__v",
      })
      .populate({
        path: "clientid",
        select: "-__v",
        populate: {
          path: "appoiments",
          select: "-__v",
        },
      })
      .populate({
        path: "clientid",
        select: "-__v",
        populate: {
          path: "appoiments",
          select: "-__v",
          populate: {
            path: "doctorid",
            select: "-__v",
          },
        },
      });
    if (packGet) {
      return res.status(200).json(packGet);
    } else {
      return res.status(400).json({ msg: "The Appoiment not exists" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};
