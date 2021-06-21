import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Skill, { ISkill } from "../models/skills";
import Doctor from "../models/doctor";
import config from "../config/config";

export const insertSkill = async (req: Request, res: Response) => {
  const { fileUrl, userID, nameSkill }: ISkill = req.body;
  if (!fileUrl || !userID || !nameSkill) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const getDoctor = await Doctor.findOne({
      _id: userID,
    });
    if (getDoctor) {
      const newPack = new Skill(req.body);
      await Doctor.updateOne(
        { _id: getDoctor.id },
        { $push: { skills: newPack.id } }
      );
      await newPack.save();
      return res.status(200).json({ msg: "skill registered" });
    } else {
      return res.status(400).json({ msg: "not professional available" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin") {
    try {
      const newSkill = await Skill.findById({ _id: id });
      if (!newSkill) {
        return res.status(400).json({ msg: "The Skill not exists" });
      } else {
        Skill.updateOne({ _id: id }, data)
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

export const deleteSkill = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  try {
    const newSkill = await Skill.findById({ _id: id });
    if (!newSkill) {
      return res.status(400).json({ msg: "The Skill not exists" });
    } else {
      Skill.deleteOne({ _id: id })
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
};

export const getSkills = async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);
  if (auth.role === "admin") {
    try {
      Skill.find()
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

export const getSkillById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin" || auth.role === "professional") {
    try {
      const newSkill = await Skill.findById({ _id: id });
      if (newSkill) {
        return res.status(200).json(newSkill);
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

export const getSkillByProfessionalId = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  const auth: any = jwt.verify(token.replace("Bearer ", ""), config.JWTSecret);

  if (auth.role === "admin" || auth.role === "professional") {
    try {
      const professial = await Doctor.findOne({
        _id: id,
      });
      if (professial) {
        const newSkill = await Skill.find({ userID: id });
        if (newSkill) {
          return res.status(200).json(newSkill);
        } else {
          return res.status(400).json({ msg: "The Payment not exists" });
        }
      } else {
        return res.status(400).json({ msg: "not professional available" });
      }
    } catch (error) {
      return res.status(400).json({ msg: error.errors });
    }
  } else {
    return res.status(400).json({ msg: "unauthorized" });
  }
};

import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  keyFilename: "./src/config/zasapi-firebase-adminsdk-i7j1w-4ec47952e8.json",
});

const bucket = storage.bucket("gs://zas-services.appspot.com");

export const upload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const token = req.headers.authorization || "";
    const auth: any = jwt.verify(
      token.replace("Bearer ", ""),
      config.JWTSecret
    );

    if (!req.file) {
      res.status(400).send("Error, could not upload file");
      return;
    }

    const blob = bucket.file(
      `${auth.id}(${req.file.originalname.substring(
        0,
        req.file.originalname.length - 4
      )})`
    );

    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobWriter.on("error", (err: any) => next(err));

    blobWriter.on("finish", () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURI(blob.name)}?alt=media`;

      res.status(200).send(publicUrl);
    });

    blobWriter.end(req.file.buffer);
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};
