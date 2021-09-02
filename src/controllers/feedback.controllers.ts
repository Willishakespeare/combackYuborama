import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Feedback, { IFeedBack } from "../models/feedback";
import Appoiment from "../models/appoiment";
import config from "../config/config";

export const addFeedback = async (req: Request, res: Response) => {
  const { feedback, comment, appoiment, rate } = req.body;
  if (!feedback || !comment || !appoiment) {
    return res.status(400).json({ msg: "send all data please" });
  }

  try {
    const getAppoiment = await Appoiment.findById({ _id: appoiment });
    if (getAppoiment) {
      const newFeedback = new Feedback({ feedback, comment, rate });
      await Appoiment.updateOne(
        { _id: appoiment },
        {
          status: "complete",
          feedback: newFeedback._id,
        }
      );
      await newFeedback.save();
      return res.status(200).json({ msg: "Feedback Created" });
    } else {
      return res.status(400).json({ msg: "The Appoiment not exists" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const updateFeedback = async (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  try {
    const feedbackGet = await Feedback.findById({ _id: id });
    if (!feedbackGet) {
      return res.status(400).json({ msg: "The Feedback not exists" });
    } else {
      if (data.hour) {
        data.hour = new Date(data.hour);
      }
      Feedback.updateOne({ _id: id }, data)
        .then(() => {
          return res.status(200).json({ msg: "Feedback Updated" });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err });
        });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  try {
    const feedbackGet = await Feedback.findById({ _id: id });
    if (!feedbackGet) {
      return res.status(400).json({ msg: "The Feedback not exists" });
    } else {
      Feedback.deleteOne({ _id: id })
        .then(() => {
          Feedback.deleteOne({ _id: feedbackGet.feedback })
            .then(() => {
              return res.status(200).json({ msg: "Feedback Deleted" });
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
};

export const getFeedbacks = async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  try {
    Feedback.find()
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

export const getFeedbackById = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ msg: "send all data please" });
  }

  const token = req.headers.authorization || "";
  try {
    const feedbackGet = await Feedback.findById({ _id: id });
    if (feedbackGet) {
      return res.status(200).json(feedbackGet);
    } else {
      return res.status(400).json({ msg: "The Feedback not exists" });
    }
  } catch (error: any) {
    return res.status(400).json({ msg: error.errors });
  }
};
