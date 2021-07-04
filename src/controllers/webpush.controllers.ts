import { Request, Response } from "express";
import Client from "../models/client";
import Doctor from "../models/doctor";
import webpush from "web-push";

const public_key =
  "BFHUzJTDRFwwmWBEUxRXClwc3ZJgTKqU_Twzf3CpJHlNN7U3jW7k5NA8_JcKbsfTPN9nVL8o-IrXU4V1JuVwM_w";

const private_key = "kRud_15IMgWXX5yPbkxEh6gFWhiDQt8J86H-pXBj7sk";

export const subscription = async (req: Request, res: Response) => {
  const { id, subscription } = req.body;

  const Clientget = await Client.findById({ _id: id });
  const Doctorget = await Doctor.findById({ _id: id });
  if (Clientget) {
    await Client.updateOne({ _id: id }, { subscription });
    try {
      const payload = JSON.stringify({
        type: "init",
        title: "Hi You Have A New Appoiment",
        message: "Enter your inbox and check your new emails",
      });

      webpush.setVapidDetails(
        "mailto:test@comeback.com",
        public_key,
        private_key
      );

      await webpush.sendNotification(subscription, payload);
    } catch (error) {
      console.log(error);
    }
    return res.status(200).json({ msg: "Subcribed" });
  }
  if (Doctorget) {
    await Doctor.updateOne({ _id: id }, { subscription });
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

      await webpush.sendNotification(subscription, payload);
    } catch (error) {
      console.log(error);
    }
    return res.status(200).json({ msg: "Subcribed" });
  } else {
    return res.status(400).json();
  }
};
