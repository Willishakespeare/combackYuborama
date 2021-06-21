import { Request, Response } from "express";
import Pack, { IPack } from "../models/pack";

export const insertPack = async (req: Request, res: Response) => {
  const { namepack, descpack, price, currency, idpack }: IPack = req.body;
  if (!namepack || !descpack || !price || !currency || idpack) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const packGet = await Pack.findOne({ namepack });
    if (packGet) {
      return res.status(400).json({ msg: "The pack already exists" });
    } else {
      const newPack = new Pack(req.body);
      await newPack.save();
      return res.status(200).json({ msg: "pack registered" });
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const updatePack = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const packGet = await Pack.findById({ _id: id });
    if (!packGet) {
      return res.status(400).json({ msg: "The pack not exists" });
    } else {
      Pack.updateOne({ _id: id }, data)
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

export const deletePack = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const packGet = await Pack.findById({ _id: id });
    if (!packGet) {
      return res.status(400).json({ msg: "The pack not exists" });
    } else {
      Pack.deleteOne({ _id: id })
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

export const getPacks = async (req: Request, res: Response) => {
  try {
    Pack.find()
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

export const getPackById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const packGet = await Pack.findById({ _id: id });
    if (packGet) {
      return res.status(200).json(packGet);
    } else {
      return res.status(400).json({ msg: "The pack not exists" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.errors });
  }
};
