import { body, param,  validationResult } from "express-validator";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";

import User from "../models/User.js";
import mongoose from 'mongoose';


const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);

        const firstMessage = errorMessages[0];
        console.log(Object.getPrototypeOf(firstMessage));
        if (errorMessages[0].startsWith('no job')) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith('not authorized')) {
          throw new UnauthorizedError('not authorized to access this route');
        }
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};
export const validateRegisterInput = withValidationErrors([
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isUppercase()
    .withMessage("name must be uppercase")
    .custom(async (name) => {
      const user = await User.findOne({ name });
      if (user) {
        throw new BadRequestError("name already exists");
      }
    }),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BadRequestError("email already exists");
      }
    }),
  
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new BadRequestError("Passwords do not match");
      }
      return true;
    }),

    

]);
  

  export const validateLoginInput = withValidationErrors([
    body('email')
      .notEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('invalid email format'),
    body('password').notEmpty().withMessage('password is required'),
  ]);

  export const validateUserEditInput = withValidationErrors([
    body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BadRequestError("email already exists");
      }
    }),
    body("name")
    .notEmpty()
    .withMessage("name is required")
    .custom(async (name) => {
      const user = await User.findOne({ name });
      if (user) {
        throw new BadRequestError("name already exists");
      }
    }),
  ]);


