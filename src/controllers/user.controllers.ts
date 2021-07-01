import { Request, Response, NextFunction } from "express";
import Client from "../models/client";
import Doctor from "../models/doctor";
import { Storage } from "@google-cloud/storage";
import bcrypt from "bcrypt";

const storage = new Storage({
  keyFilename: "./src/config/zasapi-firebase-adminsdk-i7j1w-4ec47952e8.json",
});

const bucket = storage.bucket("gs://zas-services.appspot.com");

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.body;
  if (!req.file || !id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const blob = bucket.file(
    `$${req.file.originalname.substring(0, req.file.originalname.length - 4)}`
  );

  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobWriter.on("error", (err: any) => next(err));

  blobWriter.on("finish", async () => {
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURI(blob.name)}?alt=media`;

    const Clientget = await Client.findById({ _id: id });
    const Doctorget = await Doctor.findById({ _id: id });
    if (Clientget) {
      Client.updateOne({ _id: id }, { photoid: publicUrl })
        .then(() => {
          res.status(200).send(publicUrl);
        })
        .catch((error) => {
          res.status(400).send(error);
        });
    }
    if (Doctorget) {
      Doctor.updateOne({ _id: id }, { photoid: publicUrl })
        .then(() => {
          res.status(200).send(publicUrl);
        })
        .catch((error) => {
          res.status(400).send(error);
        });
    }
  });

  blobWriter.end(req.file.buffer);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!data || !id) {
    return res.status(400).json({ msg: "send all data please" });
  }
  if (data.password && data.password.trim().length > 1) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);
    data.password = hash;
  } else {
    delete data.password;
  }

  try {
    const Clientget = await Client.findById({ _id: id });
    const Doctorget = await Doctor.findById({ _id: id });
    if (Clientget) {
      await Client.updateOne({ _id: id }, data);
      return res.status(200).json({ msg: "Data Updated" });
    }
    if (Doctorget) {
      await Doctor.updateOne({ _id: id }, data);
      return res.status(200).json({ msg: "Data Updated" });
    } else {
      return res.status(400).json("error");
    }
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    await Client.deleteOne({ _id: id })
      .then(() => {
        return res.status(200).json({ msg: "Data Delete" });
      })
      .catch((err) => {
        return res.status(400).json({ msg: err });
      });
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const getByRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    if (role === "client") {
      const getClient = await Client.find()
        .populate("payment")
        .populate("pack");
      return res.status(200).json(getClient);
    } else if (role === "doctor") {
      const getDoctor = await Doctor.find().populate("skills", "-__v");
      return res.status(200).json(getDoctor);
    } else {
      return res.status(400).json({ msg: "role not exist" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const getClient = await Client.findById(id)
      .populate("payment", "-__v")
      .populate("pack", "-__v")
      .populate("condition", "-__v")
      .populate("appoiments", "-__v")
      .populate("diagnostics", "-__v")
      .populate("settings", "-__v")
      .populate({
        path: "observations",
        select: "observation createdAt",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "doctorid",
          select: "name lastname",
        },
      })
      .populate({
        path: "appoiments",
        select: "-__v",
        populate: {
          path: "doctorid",
          select: "-__v",
        },
      });

    const getDoctor = await Doctor.findOne({ _id: id })
      .populate("skills", "-__v")
      .populate("appoiments", "-__v")
      .populate("settings", "-__v")
      .populate({
        path: "appoiments",
        select: "-__v",
        populate: {
          path: "feedback",
          select: "-__v",
        },
      })
      .populate({
        path: "appoiments",
        select: "-__v",
        populate: {
          path: "clientid",
          select: "-__v",
        },
      })
      .populate("diagnostics", "-__v");

    if (!getClient && !getDoctor) {
      return res.status(400).json({ msg: "Please. Send all Information" });
    } else {
      return res.status(200).json(getClient || getDoctor);
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ msg: error.errors });
  }
};
