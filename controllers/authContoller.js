import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError, UnauthorizedError } from "../errors/customErrors.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  const isSecondAccount = (await User.countDocuments()) === 1;
  req.body.role = isFirstAccount ? "superAdmin" : isSecondAccount ? "admin" : "user";
  req.body.hasUploadSelf = isFirstAccount ? true :isSecondAccount ? true: req.body.role === "user" ? true : false;
  req.body.hasUploadNonSelf = isFirstAccount ? true:isSecondAccount ? true : false;
  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "user created" });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  const isValidUser =
    user && (await comparePassword(req.body.password, user.password));

  if (!isValidUser) throw new UnauthenticatedError("invalid credentials");
  if (user.userLock==="true") throw new UnauthorizedError("account blocked! kindly contact admin");

  const token = createJWT({ userId: user._id, role: user.role, name: user.name, hasUploadSelf: user.hasUploadSelf, hasUploadNonSelf: user.hasUploadNonSelf, daycareIPDLock: user.daycareIPDLock});

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
  });
  res.status(StatusCodes.OK).json({ msg: "user logged in" });
};


export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};