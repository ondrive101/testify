import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import Dispensary from "../models/Dispensary.js";

export const createDispensaryRequest = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;
    const dispensary = await Dispensary.create(req.body);
    res.status(StatusCodes.OK).json({ msg: "Dispensary created successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};

export const getDispensaryList = async (req, res) => {
  const data = await Dispensary.find({});
  res.status(StatusCodes.OK).json({ data });
};

export const updateDispensaryList = async (req, res) => {
  try {
    if (req.body.type === "add") {
      const dispensary = await Dispensary.findById(req.body.dispensaryKey);
      if (!dispensary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: "Dispensary not found" });
      }

      const newDoctorArray = dispensary.dispensaryDoctor;

      if (newDoctorArray.includes(req.body.doctorName)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: "Doctor already exists" });
      }
      newDoctorArray.push(req.body.doctorName);

      await Dispensary.findByIdAndUpdate(
        req.body.dispensaryKey,
        {
          dispensaryDoctor: newDoctorArray,
        },
        {
          new: true,
        }
      );

      res
        .status(StatusCodes.OK)
        .json({ msg: "Dispensary updated successfully" });
    }

    if (req.body.type === "delete") {
      const dispensary = await Dispensary.findById(req.body.dispensaryKey);
      if (!dispensary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: "Dispensary not found" });
      }

      const newDoctorArray = dispensary.dispensaryDoctor;

      if (!newDoctorArray.includes(req.body.dispensaryDoctor)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: "Doctor does not exist" });
      }
      newDoctorArray.splice(
        newDoctorArray.indexOf(req.body.dispensaryDoctor),
        1
      );

      await Dispensary.findByIdAndUpdate(
        req.body.dispensaryKey,
        {
          dispensaryDoctor: newDoctorArray,
        },
        {
          new: true,
        }
      );

      res
        .status(StatusCodes.OK)
        .json({ msg: "Dispensary updated successfully" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};
