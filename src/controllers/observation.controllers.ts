import { Request, Response } from "express";
import Observation from "../models/observation";
import Client from "../models/client";


export const insertCondition = async (req: Request, res: Response) => {
  const { observation, doctorid, userid } = req.body;
  if (!doctorid || !observation || !userid) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const client = await Client.findOne({ _id: userid, });
    if (client) {
      const newObservation = new Observation(req.body);
      console.log(newObservation);
      await Client.updateOne({ _id: userid }, { $push: { observations: newObservation._id } });
      const guardado = await newObservation.save();
      console.log(guardado);
      return res.status(200).json({ msg: "Observation registered" });
    } else {
      return res.status(400).json({ msg: "not client available" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};