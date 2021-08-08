import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Payment, { IPayment } from "../models/payment";
import Client from "../models/client";
import Pack from "../models/pack";
import PayTokenModel from "../models/paytoken";
import rp from "request-promise";
import config from "../config/config";
import nodemailer from "nodemailer";
import Appoiment, { IAppoiments } from "../models/appoiment";
import Doctor from "../models/doctor";
import webpush from "web-push";
import TemplateEmail from "./emailApoiments";
import { insertAppoiment } from "./appoiments.controllers";

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
  const payTokenModel = await PayTokenModel.findById(idpay);
  if (!payTokenModel) {
    return res.status(200).json({ msg: "payToken no exits" });
  }
  const data: any = jwt.decode(payTokenModel.data);
  if (data) {
    const client = await Client.findById({ _id: data.idclient }).select("name");
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
        clientid: data.idclient,
      };
      await Client.updateOne(
        { _id: client.id },
        { $push: { paymentdone: payTokenModel._id } }
      );
      try {
        insertAppoiment(req, res);
      } catch (error) {
        return res.status(200).send(error);
      }
      // return res.status(200).json({ msg: "paso" });
    }
  }
};

const Days = [
  { hours: "8:00-9:00 AM", values: "8:00" },
  { hours: "9:00-10:00 AM", values: "9:00" },
  { hours: "10:00-11:00 AM", values: "10:00" },
  { hours: "6:00-7:00 PM", values: "18:00" },
  { hours: "7:00-8:00 PM", values: "19:00" },
  { hours: "8:00-9:00 PM", values: "20:00" },
];

const DaysS = ["sun", "Mon", "Tue", "Wed", "Thu", "Fri", "sat"];
const DaysD: any = [
  [
    { hours: "8:00-9:00 AM", values: "8:00" },
    { hours: "9:00-10:00 AM", values: "9:00" },
    { hours: "7:00-8:00 PM", values: "19:00" },
    { hours: "8:00-9:00 PM", values: "20:00" },
  ],
  [
    { hours: "8:00-9:00 AM", values: "8:00" },
    { hours: "9:00-10:00 AM", values: "9:00" },
    { hours: "10:00-11:00 AM", values: "10:00" },
    { hours: "6:00-7:00 PM", values: "18:00" },
    { hours: "7:00-8:00 PM", values: "19:00" },
    { hours: "8:00-9:00 PM", values: "20:00" },
  ],
  [
    { hours: "8:00-9:00 AM", values: "8:00" },
    { hours: "9:00-10:00 AM", values: "9:00" },
    { hours: "10:00-11:00 AM", values: "10:00" },
    { hours: "6:00-7:00 PM", values: "18:00" },
    { hours: "7:00-8:00 PM", values: "19:00" },
    { hours: "8:00-9:00 PM", values: "20:00" },
  ],
  [
    { hours: "8:00-9:00 AM", values: "8:00" },
    { hours: "9:00-10:00 AM", values: "9:00" },
    { hours: "7:00-8:00 PM", values: "19:00" },
    { hours: "8:00-9:00 PM", values: "20:00" },
  ],
  [
    { hours: "8:00-9:00 AM", values: "8:00" },
    { hours: "9:00-10:00 AM", values: "9:00" },
    { hours: "7:00-8:00 PM", values: "19:00" },
    { hours: "8:00-9:00 PM", values: "20:00" },
  ],
];

export const payAcceptedPackages = async (req: Request, res: Response) => {
  console.log("e");
  const { idpay } = req.body;
  if (!idpay) {
    return res.status(200).json({ msg: "send all data" });
  }
  const payTokenModel = await PayTokenModel.findById(idpay);
  if (!payTokenModel) {
    return res.status(200).json({ msg: "payToken no exits" });
  }
  const data: any = jwt.decode(payTokenModel.data);
  if (data) {
    try {
      const getDoctors = await Doctor.find();
      const arrayOfDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date("08/07/2021");
        const first = date.getDate() + 1;
        const day = new Date(date.setDate(first + i));
        return { day: DaysS[day.getDay()], date: day };
      }).filter((x) => x.day != "sun" && x.day != "sat");

      const avilesdaysdoctors = await Promise.all(
        getDoctors.map(
          async (doctor) =>
            await Promise.all(
              arrayOfDays.map(async (newdate) => {
                const getAppoiments = await Appoiment.find({
                  day: newdate.date.getDate(),
                  month: newdate.date.getMonth() + 1,
                  year: newdate.date.getFullYear(),
                  status: "incomplete",
                  doctorid: doctor._id,
                });
                const availablehoursDayDoctor = doctor.availability[
                  newdate.date.getDay() == 0 ? 6 : newdate.date.getDay() - 1
                ]
                  .map((element, index) => (element === true ? index : -1))
                  .filter((e) => e !== -1)
                  .map((e2) => ({
                    hours: Days[e2]?.hours,
                    value: Days[e2]?.values,
                  }))
                  .filter(
                    (hour) =>
                      !getAppoiments.some(
                        (appoiment) => appoiment.hours == hour.value
                      )
                  );
                return availablehoursDayDoctor;
              })
            )
        )
      );
      console.log(avilesdaysdoctors);
      // const getAvailable = await Promise.all(
      //   getDoctors.map(async (e) => {

      //     var input = new Date();
      //     const Weeks = await Promise.all(
      //       result.map(async (d) => {
      //         const newdate = new Date(d.toString());
      //         const getAppoiments = await Appoiment.find({
      //           day: newdate.getDate(),
      //           month: newdate.getMonth() + 1,
      //           year: newdate.getFullYear(),
      //           status: "incomplete",
      //           doctorid: e._id,
      //         });

      //         const availablehoursDayDoctor = e.availability[
      //           newdate.getDay() == 0 ? 6 : newdate.getDay() - 1
      //         ]
      //           .map((element, index) => (element === true ? index : -1))
      //           .filter((e) => e !== -1)
      //           .map((e2) =>
      //             Days[e2]?.hours
      //               ? { hours: Days[e2].hours, value: Days[e2].values }
      //               : false
      //           )
      //           .filter((e) => e !== false)
      //           .filter(
      //             (hour: any) =>
      //               !getAppoiments.some(
      //                 (appoiment) => appoiment.hours == hour.value
      //               )
      //           );
      //         return {
      //           day: newdate.toString().substring(0, 3),
      //           hours: availablehoursDayDoctor,
      //           date: newdate,
      //         };
      //       })
      //     );

      //     return { id: e.id, weeks: Weeks };
      //   })
      // );

      // const getDaysSTemp = DaysS.map((e: any, i) => {
      //   const getAVL = getAvailable.map((item) => {
      //     const GA = item.weeks.find((week) => week.day === e);

      //     const temp = DaysD[i].map((itemD: any) =>
      //       GA?.hours.find((eHour: any) => eHour.value === itemD.values)
      //         ? GA?.hours.find((eHour: any) => eHour.value === itemD.values)
      //         : false
      //     );

      //     const istrue = temp.find((e: any) => e === false);

      //     return istrue === undefined
      //       ? { id: item.id, day: GA?.day, temp, date: GA?.date }
      //       : false;
      //   });

      //   return getAVL.filter((getAVLItem: any) => getAVLItem !== false);
      // });

      // const tempo = getDaysSTemp
      //   .map((getDaysSTempItem, indexTempIdex) => {
      //     return getDaysSTempItem.find(
      //       (findTempItem: any) => findTempItem.day === DaysS[indexTempIdex]
      //     );
      //   })
      //   .filter((e: any) => e !== undefined);

      // tempo.map(async (e: any) => {
      //   e.temp.map(async (e2: any) => {
      //     req.body = {
      //       name: "New Appoiment",
      //       hours: e2.value,
      //       desc: "Appoiment Description",
      //       details: "Appoiment Details",
      //       day: e.date.getDate() + 3,
      //       month: e.date.getMonth() + 1,
      //       year: e.date.getFullYear(),
      //       recomendation: "Appoiment Recomendation",
      //       doctorid: e.id,
      //       clientid: data.idclient,
      //     };
      //     await Client.updateOne(
      //       { _id: data.idclient },
      //       { $push: { paymentdone: payTokenModel._id } }
      //     );
      //     try {
      //       // insertAppoimentCreate(req);
      //       return res.status(200).send('holi');
      //     } catch (error) {
      //       return res.status(200).send(error);
      //     }
      //   });
      // });
      return res.status(200).json({ msg: `appoiments creadas` });
    } catch (error) {
      return res.status(400).json({ msg: "no hay doctores disponibles" });
    }
  }
};

export const getPay = async (req: Request, res: Response) => {
  const { idpay } = req.body;
  if (!idpay) {
    return res.status(200).json({ msg: "send all data" });
  }
  const payTokenModel = await PayTokenModel.findById(idpay);
  if (!payTokenModel) {
    return res.status(200).json({ msg: "payToken no exits" });
  }
  return res.status(200).json({ data: jwt.decode(payTokenModel.data) });
};

export const updatePay = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (data && id) {
    const paytoken = await PayTokenModel.findById(id);
    if (paytoken) {
      let datac: any = jwt.decode(paytoken.data);
      Object.keys(data).map((x) => (datac[x] = data[x]));
      delete datac.exp;
      PayTokenModel.updateOne(
        { _id: id },
        {
          data: jwt.sign(datac, config.JWTSecret, {
            expiresIn: 86400,
          }),
        }
      )
        .then(() => {
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
  const clientt = await Client.findById(id);
  if (!clientt) {
    return res.status(400).json({ msg: "client no exits" });
  }

  const client = await Client.findById({ _id: id })
    .select("paymentdone")
    .populate({
      path: "paymentdone",
      select: "-__v",
    });
  if (!client) {
    return res.status(400).json({ msg: "client no exits" });
  }
  const decodedata = client.paymentdone.map((e: any) => jwt.decode(e.data));
  console.log(client);
  return res.status(200).json({ decodedata: decodedata });
};

export const insertAppoimentCreate = async (req: any) => {
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
                client.settings.jsonSettings.notify_appointment
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
                doctor.settings.jsonSettings.notify_appointment
              ) {
                await webpush.sendNotification(doctor.subscription, payload);
              }
            } catch (error) {
              console.log("error");
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
                doctor.settings.jsonSettings.email || doctor.email
              );
            }
            console.log("if");
            if (client.settings.jsonSettings.notify_email_appointment) {
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
            }
          })
          .catch(function (err) {});
      } else {
      }
    } else {
    }
  } catch (error) {}
};
