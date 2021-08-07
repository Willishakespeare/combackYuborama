import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Appoiment, { IAppoiments } from "../models/appoiment";
import Client from "../models/client";
import Doctor from "../models/doctor";
import Feedback from "../models/feedback";
import config from "../config/config";
import nodemailer from "nodemailer";
import TemplateEmail from "./emailApoiments";
import rp from "request-promise";
import webpush from "web-push";

const public_key =
  "BFHUzJTDRFwwmWBEUxRXClwc3ZJgTKqU_Twzf3CpJHlNN7U3jW7k5NA8_JcKbsfTPN9nVL8o-IrXU4V1JuVwM_w";

const private_key = "kRud_15IMgWXX5yPbkxEh6gFWhiDQt8J86H-pXBj7sk";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "Stacklycode@gmail.com",
    pass: "XHG|d%|/=Y,fc6*|q1d1",
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
    const doctor: any = await Doctor.findOne({
      _id: doctorid,
    }).populate("settings", "-__v");
    if (doctor) {
      const client: any = await Client.findOne({
        _id: clientid,
      }).populate("settings", "-__v");
      if (client) {
        const payload = {
          iss: config.development.APIKey,
          exp: new Date().getTime() + 5000,
        };
        const token = jwt.sign(payload, config.development.APISecret);
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const date = new Date(`${months[month]} ${day}, ${year} ${hours}:00`);

        var options = {
          method: "POST",
          uri: "https://api.zoom.us/v2/users/Clinicaconductualvolver@gmail.com/meetings",
          body: {
            topic: "test create meeting",
            type: 2,
            start_time: date,
            host_email: doctor.email,
            agenda: "Hola",
            settings: {
              host_video: "true",
              participant_video: "true",
              join_before_host: "true",
            },
          },
          auth: {
            bearer: token,
          },
          headers: {
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json",
          },
          json: true, //Parse the JSON string in the response
        };

        rp(options)
          .then(async (response) => {
            const newAppoiment = new Appoiment({
              name,
              hours,
              desc,
              details,
              day,
              month,
              year,
              urlzoom: response.join_url,
              hosturlzoom: response.start_url,
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
            console.log("try");
            try {
              const payload = JSON.stringify({
                type: "appoiment",
                title: "Hi You Have A New Appoiment",
                message: "Enter your inbox and check your new emails",
              });
              console.log("web push");
              webpush.setVapidDetails(
                "mailto:test@comeback.com",
                public_key,
                private_key
              );
              console.log("if try");
              if (
                client.subscription &&
                client?.settings?.jsonSettings?.notify_appointment
              ) {
                try {
                  await webpush.sendNotification(client.subscription, payload);
                } catch (error) {
                  console.log("error2");
                  console.log(error);
                }
              }
              console.log("if try2");

              if (
                doctor.subscription &&
                doctor?.settings?.jsonSettings?.notify_appointment
              ) {
                await webpush.sendNotification(doctor.subscription, payload);
              }
            } catch (error) {
              console.log("error if");
              console.log(error);
            }
            console.log("if2");
            if (doctor.settings.jsonSettings.notify_email_appointment) {
              await mailer(
                TemplateEmail(
                  doctor.name,
                  response.start_url,
                  day,
                  month,
                  year,
                  hours
                ),
                doctor?.settings?.jsonSettings?.email || doctor.email
              );
            }
            console.log("if");
            if (client?.settings?.jsonSettings?.notify_email_appointment) {
              console.log("envio correo antes");
              await mailer(
                TemplateEmail(
                  client.name,
                  response.start_url,
                  day,
                  month,
                  year,
                  hours
                ),
                client.settings.jsonSettings.email || client.email
              );
              console.log("envio correo despues");
            }
            console.log("mirame");
            return res.status(200).json(newAppoiment._id);
            console.log("mirame2");
          })
          .catch(function (err) {
            // console.log("error");
            // console.log(err);

            res.status(400).json({ msg: err });
          });
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
      .populate({
        path: "feedback",
        select: "-__v",
      })
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

export const availablehours = async (req: Request, res: Response) => {
  const { iddoctor, date } = req.body;
  if (!iddoctor || !date) {
    return res.status(400).json({ msg: "send all data please" });
  }
  try {
    const doctor = await Doctor.findById({ _id: iddoctor });
    if (!doctor) {
      return res.status(400).json({ msg: "el doctor no existe" });
    } else {
      const newdate = new Date(date);

      let Days = [
        { hours: "7:00-8:00 AM", values: "7:00" },
        { hours: "8:00-9:00 AM", values: "8:00" },
        { hours: "9:00-10:00 AM", values: "9:00" },
        { hours: "10:00-11:00 AM", values: "10:00" },
        { hours: "11:00-12:00 AM", values: "11:00" },
        { hours: "12:00-1:00 PM", values: "12:00" },
        { hours: "1:00-2:00 PM", values: "13:00" },
        { hours: "2:00-3:00 PM", values: "14:00" },
        { hours: "3:00-4:00 PM", values: "15:00" },
        { hours: "4:00-5:00 PM", values: "16:00" },
        { hours: "6:00-7:00 PM", values: "18:00" },
        { hours: "7:00-8:00 PM", values: "19:00" },
        { hours: "8:00-9:00 PM", values: "20:00" },
        { hours: "9:00-10:00 PM", values: "21:00" },
      ];

      const getAppoiments = await Appoiment.find({
        day: newdate.getDate(),
        month: newdate.getMonth() + 1,
        year: newdate.getFullYear(),
        status: "incomplete",
        doctorid: doctor._id,
      });
      const availablehoursDayDoctor = doctor.availability[
        newdate.getDay() == 0 ? 6 : newdate.getDay() - 1
      ]
        .map((element, index) => (element === true ? index : -1))
        .filter((e) => e !== -1)
        .map((e2) => ({ hours: Days[e2].hours, value: Days[e2].values }))
        .filter(
          (hour) =>
            !getAppoiments.some((appoiment) => appoiment.hours == hour.value)
        );

      return res
        .status(200)
        .json({ availablehoursDayDoctor: availablehoursDayDoctor });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};
