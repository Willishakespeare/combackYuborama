import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Client, { IClient } from "../models/client";
import Doctor, { IDoctor } from "../models/doctor";
import Settings, { ISettings } from "../models/settings";
import config from "../config/config";
import nodemailer from "nodemailer";
import TemplateEmail from "./emailConfirm";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "mailcomebackapp@gmail.com",
    pass: "zcbekdcdxzntfrtk",
  },
});

interface IContact {
  input: {
    name: string;
    email: string;
    message: string;
  };
}

const mailer = (token: string, email: string) => {
  const messageSend = {
    from: "stacklycode@gmail.com",
    to: email,
    subject: `Verify Email`,
    html: token,
    replyTo: "stacklycode@gmail.com",
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(messageSend, (error, info) =>
      error ? reject(error) : resolve(info)
    );
  });
};

function createTokenClient(user: IClient) {
  const { id, role } = user;

  return jwt.sign(
    {
      id,
      role,
    },
    config.JWTSecret,
    {
      expiresIn: 86400,
    }
  );
}

function createTokenDoctor(user: IDoctor) {
  const { id, role } = user;

  return jwt.sign(
    {
      id,
      role,
    },
    config.JWTSecret,
    {
      expiresIn: 86400,
    }
  );
}

function createTokenEmail(token: string) {
  return jwt.sign({ token: token }, config.JWTSecret, {
    expiresIn: 86400,
  });
}

export const registerClient = async (req: Request, res: Response) => {
  const { username, email, password }: IClient = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ msg: "Please. Send all Information" });
  }

  try {
    const client = await Client.findOne({ $or: [{ username }, { email }] });

    if (client) {
      return res.status(400).json({ msg: "The user already exists" });
    } else {
      const setting = new Settings();
      await setting.save();
      const newClient = new Client({
        username,
        email,
        password,
        setting: setting.id,
      });
      await mailer(
        TemplateEmail(
          `https://comeback-ts.com/verify/${createTokenEmail(newClient._id)}`,
          newClient.name || newClient.username
        ),
        newClient.email
      );
      await newClient.save();
      return res.status(200).json({ token: createTokenClient(newClient) });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error });
  }
};

export const registerDoctor = async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    name,
    lastname,
    role,
    gdate,
    gener,
    language,
    cellphone,
    phone,
    documentidentity,
    medicalid,
    verify,
    photoid,
    speciality,
    noex,
    whatsapp,
    honorarium,
    descprofile,
    skills,
  }: IDoctor = req.body;
  if (
    !username ||
    !email ||
    !password ||
    !name ||
    !lastname ||
    !role ||
    !gdate ||
    !gener ||
    !language ||
    !cellphone ||
    !phone ||
    !documentidentity ||
    !medicalid ||
    !speciality ||
    !noex ||
    !whatsapp ||
    !honorarium ||
    !descprofile
  ) {
    return res.status(400).json({ msg: "Please. Send all Information" });
  }

  try {
    const doctor = await Doctor.findOne({ $or: [{ username }, { email }] });
    const availability = Array.from({ length: 7 }, () =>
      Array.from({ length: 14 }, () => false)
    );
    if (doctor) {
      return res.status(400).json({ msg: "The user already exists" });
    } else {
      const setting = new Settings();
      await setting.save();
      const newDoctor = new Doctor({
        username,
        email,
        password,
        name,
        lastname,
        role,
        gdate,
        gener,
        language,
        cellphone,
        phone,
        documentidentity,
        medicalid,
        speciality,
        noex,
        whatsapp,
        honorarium,
        descprofile,
        availability,
        setting: setting.id,
      });
      await mailer(
        TemplateEmail(
          `http://localhost:3000/verify/${createTokenEmail(newDoctor._id)}`,
          newDoctor.name
        ),
        newDoctor.email
      );
      await newDoctor.save();

      return res.status(200).json({ token: createTokenDoctor(newDoctor) });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: IClient = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please. Send all Information" });
  }
  try {
    const getClient = await Client.findOne({
      $or: [{ email }, { username: email }],
    })
      .populate("payment")
      .populate("pack");
    const getDoctor = await Doctor.findOne({
      $or: [{ email }, { username: email }],
    }).populate("skill");
    if (!getClient && !getDoctor) {
      return res.status(400).json({ msg: "The client not exists" });
    }
    if (getClient) {
      const isMatch = await getClient.comparePassword(password);
      if (isMatch) {
        return res.status(200).json({ token: createTokenClient(getClient) });
      }
      return res.status(400).json({ msg: "The credencial not match" });
    } else if (getDoctor) {
      const isMatch = await getDoctor.comparePassword(password);
      if (isMatch) {
        return res.status(200).json({ token: createTokenDoctor(getDoctor) });
      }
      return res.status(400).json({ msg: "The credencial not match" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const auth = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    const auth = jwt.verify(token, config.JWTSecret);
    return res.status(200).json(auth);
  }
};

type Token = {
  token: string;
  iat: number;
  exp: number;
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ msg: "Please. Send all Information" });
  }

  const verify = jwt.verify(token, config.JWTSecret);

  if (verify) {
    const id = verify as Token;
    try {
      await Client.updateOne({ _id: id.token }, { verify: true });
      return res.status(200).json({ msg: true });
    } catch (error: any) {
      return res.status(400).json(error);
    }
  } else {
    return res.status(400).json({ msg: "Token Unvailable" });
  }
};
