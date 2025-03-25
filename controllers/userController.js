import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";

export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  res.status(StatusCodes.OK).json({ user: user.withoutPasswordEmail() });
};

export const getUserList = async (req, res) => {
  const list = await User.find({ role: "user" });
  const Data = list.map((user) => {
    return {
      id: String(user._id),
      name: user.name,
    };
  });

  res.status(StatusCodes.OK).json({ Data });
};

export const getUserListAdmin = async (req, res) => {
  const list = await User.find();
  res.status(StatusCodes.OK).json({ Data: list });
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.findByIdAndDelete(req.params.id);
      res.status(StatusCodes.OK).json({ msg: "User deleted successfully" });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};






export const userEdit = async (req, res) => {
  try {
  const hasDetails = await User.findById(req.params.id);
  if(!hasDetails) { 
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "User not found" });
  }
  const hasEmail = await User.findOne({ email: req.body.email });
  if(hasEmail) { 
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Email already exists" });
  }
 
  
   const user = await User.findByIdAndUpdate(req.params.id, req.body, {
     new: true,
   })
   
    res.status(StatusCodes.OK).json({ msg: "updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};



export const userAddProperty= async (req, res) => {
  try {

    if(req.user.role !== "superAdmin"){
      return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Unauthorized" });
    }
  const { propertyName, propertyValue } = req.body;
    const result = await User.updateMany({}, { $set: { [propertyName]: propertyValue } });
      res.status(StatusCodes.OK).json({ msg: "updated successfully" });
  } catch (error) {
    console.error(error);s
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};

