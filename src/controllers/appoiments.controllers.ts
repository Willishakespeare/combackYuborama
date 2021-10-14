import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Appoiment, { IAppoiments } from "../models/appoiment";
import Client from "../models/client";
import Doctor from "../models/doctor";
import Feedback from "../models/feedback";
import config from "../config/config";
import nodemailer from "nodemailer";
import TemplateEmail, { TemplateDoctor } from "./emailApoiments";
import TemplateEmailApoimentUpdated from "./emailApoimentUpdated";
import rp from "request-promise";
import webpush from "web-push";

import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
// import mailgun from "mailgun-js";

const CREDENCIALS = {
  type: "service_account",
  project_id: "cobalt-logic-322816",
  private_key_id: "9629e41b7e198ef36c585a39216ced02fb4ffd50",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoyKmqOmZJVzPS\nLfMrFHJLcjjSfjO/yWBDNiU8AHGu5l+4XyannarzO9Eu8osnzkd7iayJTfb9AVrc\nh8NkAVBDnkrjmSnuG+NUgezkDqPT7sj7ZJD3PUVYIAQcArwbYvtiJyNrp2IcXuSG\nXlEf6kyJw8avZtxxIILLZ3l61Xe4hrDv01UYJNG4djj0LUcBhVYpGJbd7S+lt0wG\nLx9nyK+FPY35Wp3+IadoYxR6bh52BHrthKpj68baF8B1rDR2kIvWFoOklf+1VC9A\nLcQ8YVDBThlD0fFbrDWr3Wyn/ruJcUOz7cpCLCVd4HmMQA487p41epAwwmMLG40S\n9tgjDzcXAgMBAAECggEAG7QcDSHayizzB4udPzPy8qlD5GDsk401LLMFd4zHHCMa\nEQQlLxv1BEmMMz2CU71LBF77n+nZIXwIcuwhyRdiGkcwGZ15QWj4blWJEYHJqC6o\ndIL0PHClIirXIdXdFE2x31F3QeNOekOlFN0ESc3GVFJ7GS0z/6mLbmGEkgHZzcKh\npjyGivzgl69LNocfZ5TdWjf46+Gk29QhiyDexM5QYJR3WJ+QpRTgIYezOxO33mpz\n7p8Rh8tV3JKF+tofSyhwuOfnMVcRv1DhI/4aJqDiNYXPSGXIqLP5jNWT4i35XpJE\nl+O6kpJc+DOJ9QQYbhh2Vlb6Cs75qmHodtLrI2H24QKBgQDTv/jf0keav88GxLkz\nWIQpGczMUZfGmvj5Rs4GbWWArjK8REW2nytmRnt82WRUIoPOcc+0tN4nKZQKqQDM\n0h7aOsW9nxVZxlve00KxA8GhhXoBIA/I83U70cXH9ybNOTIX4xKEhYTbYxbkI9C+\ngOEhEjs9LOe0JUmUn1kyrx6zJwKBgQDMDiB0YVFKL+RcSgEn2SqQJ5AQzgEA3Wha\ntsEgdWA6RAr8zeG7EQ6kjYBiU2itEx7CNZ7S0oQf3sT//oBHUUBEaUCixStH8bc2\n6qPFgHhx2QpoMViD4HQJa7AyucuK6wph27+ho7C/dY00Au7iZmF8sLKqkx7av/F1\no0x+lTUSkQKBgCdjm4kPFbDMo1cv+v95JMR8fyM2vlP8efns2OBLM0l3ngp1bL5m\n52zUCZ6U1dvsu7YIZ8nGp1iDnH1LKNHw+DpCGoyGbjNP+cD+bXZ+K2O/b42MCEOq\nPhGNmQv0hqxASng1DjnGmIsy6IwxuV/mm3pKaOidVNCm6wQRjEcoWj6bAoGAc7EK\nu5E1io9OtPiMYTBiTmrv5mc18GyXrt7w7ls+HKrZY+3CrtID8E393UGXFpHBnbDT\nBIqwuHUQUmfUCRtLCb53FBIf8OFd1DgCdIbbQwkgOmTH37VRdMnmk0v92BxcvZDe\nvGFXY6XdUgDbueb8HLr+AXH6S2IKH31fcGFePtECgYEAic5SCjoQ2XUD1Hih0FDP\nwzCE0nn2SdKGvICvdrXcyzgnsXQKfWxJ/AORi32rAVucy6KAA91Yxt/+s6UURC+x\nBy/VKH3TJ3vkGImTJUIN5Xx/hRatx3MfgmYo61y+/0MFK+Y4eiHAIBgt7sfvkO3N\nuI9dGV7kaI7vx2yEqLAEErE=\n-----END PRIVATE KEY-----\n",
  client_email: "comeback@cobalt-logic-322816.iam.gserviceaccount.com",
  client_id: "117476500292782711619",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/comeback%40cobalt-logic-322816.iam.gserviceaccount.com",
};

const CALENDAR_ID: any =
  "c_9mfiftn3d6dk0cfmmabaob06kc@group.calendar.google.com";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const oAuthClient = new OAuth2Client(
  "531580369890-n6nn3ml1894mjeephca57cico3tonsgh.apps.googleusercontent.com",
  "NkQp1HKov23s3ZkY_R59OSzr"
);

const authUrl = oAuthClient.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth: oAuthClient });

const auth = new google.auth.JWT(
  CREDENCIALS.client_email,
  undefined,
  CREDENCIALS.private_key,
  SCOPES,
  "admin@volver.com.do",
  "117476500292782711619"
);

const TIMEOFFSET = `+05:30`;

export let googleCalendarAppoiment = async (req: Request, res: Response) => {
  axios
    .post("https://www.googleapis.com/oauth2/v4/token", {
      client_id: `531580369890-n6nn3ml1894mjeephca57cico3tonsgh.apps.googleusercontent.com`,
      client_secret: `NkQp1HKov23s3ZkY_R59OSzr`,
      grant_type: "refresh_token",
      refresh_token: `1//06T4q6ii8P_AACgYIARAAGAYSNwF-L9Ir-8_sNbU7h4gK7mwO8jkFsANcPBSiy7QiJSCc09XLF0lhjI65nrnqGCpGkX16uS-N1cw`,
    })
    .then((response: any) => {
      const { access_token } = response.data;
      oAuthClient.setCredentials({
        access_token: access_token,
        refresh_token: `1//06T4q6ii8P_AACgYIARAAGAYSNwF-L9Ir-8_sNbU7h4gK7mwO8jkFsANcPBSiy7QiJSCc09XLF0lhjI65nrnqGCpGkX16uS-N1cw`,
        scope:
          "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar",
        token_type: "Bearer",
      });
      var event = {
        summary: "FIESTA EN LA CASA DE El JC",
        location: "LA CASA DEL JC",
        description: "A chance to hear more about Google's developer products.",
        start: {
          dateTime: "2021-10-07T08:00:00-07:00",
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: "2021-10-07T09:00:00-07:00",
          timeZone: "America/Los_Angeles",
        },
        attendees: [
          { email: "lpage@example.com" },
          { email: "sbrin@example.com" },
        ],
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
            requestId: "1",
          },
        },
      };
      var eventPatch = {
        conferenceData: {
          createRequest: { requestId: "7qxalsvy0e" },
        },
      };
      calendar.events.insert(
        {
          auth: oAuthClient,
          calendarId: "primary",
          requestBody: event,
          conferenceDataVersion: 1,
        },
        (err: any, event: any) => {
          if (err) {
            console.log("error code");
            return res.status(400).json({ error: true, err });
          }

          return res.status(200).json({ error: false, data: event.data });
        }
      );
    });
};

const public_key =
  "BFHUzJTDRFwwmWBEUxRXClwc3ZJgTKqU_Twzf3CpJHlNN7U3jW7k5NA8_JcKbsfTPN9nVL8o-IrXU4V1JuVwM_w";

const private_key = "kRud_15IMgWXX5yPbkxEh6gFWhiDQt8J86H-pXBj7sk";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "mailcomebackapp@gmail.com",
    pass: "spdqtjbqfvcigyci",
  },
});

const mailer = (token: string, email: string) => {
  const messageSend = {
    from: "mailcomebackapp@gmail.com",
    to: email,
    subject: `New Appoiment`,
    html: token,
    replyTo: "mailcomebackapp@gmail.com",
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

        axios
          .post("https://www.googleapis.com/oauth2/v4/token", {
            client_id: `531580369890-n6nn3ml1894mjeephca57cico3tonsgh.apps.googleusercontent.com`,
            client_secret: `NkQp1HKov23s3ZkY_R59OSzr`,
            grant_type: "refresh_token",
            refresh_token: `1//06T4q6ii8P_AACgYIARAAGAYSNwF-L9Ir-8_sNbU7h4gK7mwO8jkFsANcPBSiy7QiJSCc09XLF0lhjI65nrnqGCpGkX16uS-N1cw`,
          })
          .then(async (response: any) => {
            const { access_token } = response.data;
            oAuthClient.setCredentials({
              access_token: access_token,
              refresh_token: `1//06T4q6ii8P_AACgYIARAAGAYSNwF-L9Ir-8_sNbU7h4gK7mwO8jkFsANcPBSiy7QiJSCc09XLF0lhjI65nrnqGCpGkX16uS-N1cw`,
              scope:
                "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar",
              token_type: "Bearer",
            });
            var event = {
              summary: "New Doctor Appoiment",
              location: "",
              description: "",
              start: {
                dateTime: date.toISOString(),
                timeZone: "America/Los_Angeles",
              },
              end: {
                dateTime: date.toISOString(),
                timeZone: "America/Los_Angeles",
              },
              attendees: [{ email: doctor.email }, { email: client.email }],
              conferenceData: {
                createRequest: {
                  conferenceSolutionKey: {
                    type: "hangoutsMeet",
                  },
                  requestId: "1",
                },
              },
            };

            calendar.events.insert(
              {
                auth: oAuthClient,
                calendarId: CALENDAR_ID,
                requestBody: event,
                conferenceDataVersion: 1,
              },
              async (err: any, event: any) => {
                if (err) {
                  console.log("error code");
                  return res.status(400).json({ msg: err });
                }

                const newAppoiment = new Appoiment({
                  name,
                  hours,
                  desc,
                  details,
                  day,
                  month,
                  year,
                  urlzoom: event.data.hangoutLink,
                  hosturlzoom: event.data.hangoutLink,
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
                try {
                  const payload = JSON.stringify({
                    type: "appoiment",
                    title: "Hi You Have A New Appoiment",
                    message: "Enter your inbox and check your new emails",
                  });
                  webpush.setVapidDetails(
                    "mailto:test@comeback.com",
                    public_key,
                    private_key
                  );
                  if (
                    client?.subscription &&
                    client?.settings?.jsonSettings?.notify_appointment
                  ) {
                    try {
                      await webpush.sendNotification(
                        client?.subscription,
                        payload
                      );
                    } catch (error: any) {
                      console.log(error);
                    }
                  }
                  if (
                    doctor?.subscription &&
                    doctor?.settings?.jsonSettings?.notify_appointment
                  ) {
                    await webpush.sendNotification(
                      doctor?.subscription,
                      payload
                    );
                  }
                } catch (error: any) {
                  console.log(error);
                }
                if (doctor.settings.jsonSettings.notify_email_appointment) {
                  await mailer(
                    TemplateDoctor(
                      doctor.name || doctor.username,
                      response.start_url,
                      day,
                      month,
                      year,
                      hours
                    ),
                    doctor?.settings?.jsonSettings?.email || doctor.email
                  );
                }
                if (client.email) {
                  await mailer(
                    TemplateEmail(
                      client.name || client.username,
                      response.start_url,
                      day,
                      month,
                      year,
                      hours
                    ),
                    client.settings?.jsonSettings?.email || client.email
                  );
                }
                return res.status(200).json(newAppoiment._id);
              }
            );
          });
      } else {
        return res.status(400).json({ msg: "not client available" });
      }
    } else {
      return res.status(400).json({ msg: "not professional available" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error });
  }
};

export const updateAppoiment = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }
  try {
    const appoiment: any = await Appoiment.findById({ _id: id });
    if (!appoiment) {
      return res.status(400).json({ msg: "The Appoiment not exists" });
    } else {
      const appoimentGet: any = await Appoiment.findById({ _id: id })
        .populate({ path: "doctorid", select: "username name" })
        .populate({
          path: "clientid",
          select: "username email name",
          populate: {
            path: "settings",
            select: "jsonSettings",
          },
        });
      if (data.hour) {
        data.hour = new Date(data.hour);
      }
      Appoiment.updateOne({ _id: id }, data)
        .then(async () => {
          const appoimentUpdated = await Appoiment.findById({ _id: id });
          if (appoimentGet.clientid.email) {
            await mailer(
              TemplateEmailApoimentUpdated(
                appoimentGet.clientid.name || appoimentGet.clientid.username,
                appoimentGet.urlzoom,
                `${appoimentGet.day}/${appoimentGet.month}/${appoimentGet.year}`,
                `${appoimentUpdated?.day}/${appoimentUpdated?.month}/${appoimentUpdated?.year}`,
                appoimentGet.doctorid.name || appoimentGet.doctorid.username,
                appoimentGet.hours,
                appoimentUpdated?.hours || ""
              ),
              appoimentGet.clientid.settings?.jsonSettings?.email ||
                appoimentGet.clientid.email
            );
          }
          return res.status(200).json({ msg: "Appoiment Updated" });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err });
        });
    }
  } catch (error: any) {
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
    } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};
