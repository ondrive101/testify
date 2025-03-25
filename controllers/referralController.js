import { StatusCodes } from "http-status-codes";
import { formatImage } from "../middleware/multerMiddleware.js";
import cloudinary from "cloudinary";
import Referral from "../models/Referral.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import stream from "stream";
import { generatePDFCloudinary } from "../utils/generatePDF.js";
import path from "path";
import { dirname } from 'path';




export const createReferralRequest = async (req, res) => {
  try {

    // Block action if has not edit right
    const hasEditRight = await User.findOne({ _id: req.user.userId });
    if(hasEditRight.viewEditLock === "view") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "You don't have permission to perform this action. You can only view." });
    }


    // Check if files are received
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "No files were uploaded." });
    }

    // Check file size
    const fileKeys = Object.keys(req.files);
    for (const key of fileKeys) {
      const file = req.files[key];
      // Check if file size is less than 1MB
      if (file.size > 1024 * 1024) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: `File size should be less than 1MB for ${key} file.` });
      }
    }

    const card = formatImage(req.files["patientCard"][0]);
    const resultCard = await cloudinary.v2.uploader.upload(card, {
      folder: "referral_application/card",
      quality: "auto",
    });

    const prescription = formatImage(req.files["patientPrescription"][0]);
    const resultPrescription = await cloudinary.v2.uploader.upload(
      prescription,
      {
        folder: "referral_application/prescription",
        quality: "auto",
      }
    );

    //Generate Reference Number
    const date = new Date();
    const timestamp = `${date.getTime()}`; // Convert date to milliseconds
    const refNumber = timestamp.slice(-8).padStart(8, "0"); // Get the last 6 characters
    req.body.refNumber = refNumber;

    req.body.card = resultCard.secure_url;
    req.body.prescription = resultPrescription.secure_url;
    req.body.cardPublicId = resultCard.public_id;
    req.body.treatmentType = req.body.treatmentType
      ? req.body.treatmentType
      : "Daycare";
    req.body.prescriptionPublicId = resultPrescription.public_id;
    req.body.createdBy = req.user.userId;
    req.body.status = "Pending";
    const user = await User.findById(req.user.userId);
    req.body.createdByName = user.name;
    req.body.location = user.location;

    const referral = await Referral.create(req.body);
    res.status(StatusCodes.OK).json({ msg: "Referral created successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};

export const getAllReferral = async (req, res) => {
  const { panel, status, referralType, treatmentType, referralDateStart, referralDateEnd, deliveryStatus, location, clinic } = req.query;
  const queryObjectAdmin = {
   
  };
  const queryObjectUser = {
    createdBy: req.user.userId,
  };

  if (panel && panel !== '') {
    queryObjectUser.panel = panel;
    queryObjectAdmin.panel = panel;
  }

  if (status && status !== '') {
    queryObjectUser.status = status;
    queryObjectAdmin.status = status;
  }
  if (referralType && referralType !== '') {
    queryObjectUser.referralType = referralType;
    queryObjectAdmin.referralType = referralType;
  }
  if (treatmentType && treatmentType !== '') {
    queryObjectUser.treatmentType = treatmentType;
    queryObjectAdmin.treatmentType = treatmentType;
  }
  if (deliveryStatus && deliveryStatus !== '') {
    queryObjectUser.deliveryStatus = deliveryStatus;
    queryObjectAdmin.deliveryStatus = deliveryStatus;
  }
  if (deliveryStatus && deliveryStatus !== '') {
    queryObjectUser.deliveryStatus = deliveryStatus;
    queryObjectAdmin.deliveryStatus = deliveryStatus;
  }
  if (location && location !== '') {
    queryObjectUser.location = location;
    queryObjectAdmin.location = location;
  }
  if (clinic && clinic !== '') {
    queryObjectUser.createdByName = clinic;
    queryObjectAdmin.createdByName = clinic;
  }

  if (referralDateStart && referralDateEnd) {
    queryObjectUser.referralDate = {
      $gte: new Date(referralDateStart),
      $lte: new Date(referralDateEnd), 
    };
    queryObjectAdmin.referralDate = {
      $gte: new Date(referralDateStart),
      $lte: new Date(referralDateEnd), 
    };
  }
 




if (req.user.role === "admin" || req.user.role === "superAdmin") {
    const referrals = await Referral.find(queryObjectAdmin);
    const data = referrals.map((referral) => {
      return {
        id: String(referral._id),
        referenceNumber: referral.refNumber,
        name: referral.name,
        panel: referral.panel,
        clinic: referral.createdByName,
        uhid: referral.uhid,
        cardNo: referral.cardNo,
        contact: referral.contact,
        patientType: referral.patientType,
        referralType: referral.referralType,
        treatmentType: referral.treatmentType,
        status: referral.status,
        date: referral.createdAt,
        card: referral.card,
        prescription: referral.prescription,
        referral: referral.referral,
        dispensary: referral.dispensary,
        dispensaryDoctor: referral.dispensaryDoctor,
        referralDate: referral.referralDate,
        createdAt: referral.createdAt,
        deliveryStatus: referral.deliveryStatus,
        deliveryDate: referral.deliveryDate,
        location: referral.location,
      };
    });
    res.status(StatusCodes.OK).json({ data });
  }
  if (req.user.role === "user") {
    const referrals = await Referral.find(queryObjectUser);
    const data = referrals.map((referral) => {
      return {
        id: String(referral._id),
        referenceNumber: referral.refNumber,
        name: referral.name,
        panel: referral.panel,
        clinic: referral.createdByName,
        uhid: referral.uhid,
        cardNo: referral.cardNo,
        contact: referral.contact,
        patientType: referral.patientType,
        referralType: referral.referralType,
        treatmentType: referral.treatmentType,
        status: referral.status,
        date: referral.createdAt,
        card: referral.card,
        prescription: referral.prescription,
        referral: referral.referral,
        dispensary: referral.dispensary,
        dispensaryDoctor: referral.dispensaryDoctor,
        referralDate: referral.referralDate,
        createdAt: referral.createdAt,
        createdAt: referral.createdAt,
        deliveryStatus: referral.deliveryStatus,
       deliveryDate: referral.deliveryDate,
       location:referral.location
      };
    });
    res.status(StatusCodes.OK).json({ data });
  }
};

export const referralUpload = async (req, res) => {
  try {

      // Block action if has not edit right
    const hasEditRight = await User.findOne({ _id: req.user.userId });
    if(hasEditRight.viewEditLock === "view") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "You don't have permission to perform this action. You can only view." });
    }
 
    // Check if files are received
    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "No files were uploaded." });
    }
    if (req.file.size > 1024 * 1024) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: `File size should be less than 1MB for file.` });
    }


    //check if already uploaded or not
    const referralCheck = await Referral.findById(req.body.id);

    if (referralCheck.referral !== "") {
      await cloudinary.v2.uploader.destroy(referralCheck.referralPublicId);

      const referral = formatImage(req.file);
      const resultReferral = await cloudinary.v2.uploader.upload(referral, {
        folder: "referral_application/referral",
      });
      req.body.referral = resultReferral.secure_url;
      req.body.referralPublicId = resultReferral.public_id;

      await Referral.findByIdAndUpdate(req.body.id, req.body, {
        new: true,
      });

      res.status(StatusCodes.OK).json({ msg: "uploaded" });
    }

    if (referralCheck.referral === "") {
      const referral = formatImage(req.file);
      const resultReferral = await cloudinary.v2.uploader.upload(referral, {
        folder: "referral_application/referral",
      });
      req.body.referral = resultReferral.secure_url;
      req.body.referralPublicId = resultReferral.public_id;
      req.body.status = "Confirmed";

      await Referral.findByIdAndUpdate(req.body.id, req.body, {
        new: true,
      });

      res.status(StatusCodes.OK).json({ msg: "uploaded" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};

export const referralEdit = async (req, res) => {
  try {

     // Block action if has not edit right
     const hasEditRight = await User.findOne({ _id: req.user.userId });
     if(hasEditRight.viewEditLock === "view") {
       return res
         .status(StatusCodes.BAD_REQUEST)
         .json({ msg: "You don't have permission to perform this action. You can only view." });
     }
      


    const referral = await Referral.findById(req.body.id);

    if (!req.files || Object.keys(req.files).length === 0) {
      await Referral.findByIdAndUpdate(req.body.id, req.body, {
        new: true,
      });

      res.status(StatusCodes.OK).json({ msg: "updated successfully" });
    }

    // Check file size
    const fileKeys = Object.keys(req.files);
    for (const key of fileKeys) {
      const file = req.files[key];
      // Check if file size is less than 1MB
      if (file.size > 1024 * 1024) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: `File size should be less than 1MB for ${key} file.` });
      }
    }

    if (req.files["patientCard"]) {
      await cloudinary.v2.uploader.destroy(referral.cardPublicId);
      const card = formatImage(req.files["patientCard"][0]);
      const resultCard = await cloudinary.v2.uploader.upload(card, {
        folder: "referral_application/card",
      });
      req.body.card = resultCard.secure_url;
      req.body.cardPublicId = resultCard.public_id;
    }

    if (req.files["patientPrescription"]) {
      await cloudinary.v2.uploader.destroy(referral.prescriptionPublicId);
      const prescription = formatImage(req.files["patientPrescription"][0]);
      const resultPrescription = await cloudinary.v2.uploader.upload(
        prescription,
        {
          folder: "referral_application/prescription",
        }
      );
      req.body.prescription = resultPrescription.secure_url;
      req.body.prescriptionPublicId = resultPrescription.public_id;
    }

    await Referral.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
    });

    res.status(StatusCodes.OK).json({ msg: "updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};



export const referralDeliveryEdit = async (req, res) => {
  try {


     // Block action if has not edit right
     const hasEditRight = await User.findOne({ _id: req.user.userId });
     if(hasEditRight.viewEditLock === "view") {
       return res
         .status(StatusCodes.BAD_REQUEST)
         .json({ msg: "You don't have permission to perform this action. You can only view." });
     }
    const referral = await Referral.findByIdAndUpdate(req.body.id, {
      deliveryStatus: "Delivered",
      deliveryDate: new Date(),
    }, {
      new: true,
    })

    if (!referral) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Referral not found" });
    }
    
    
    res.status(StatusCodes.OK).json({ msg: "updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};


export const referralRejectCancelEdit = async (req, res) => {
  try {

     // Block action if has not edit right
     const hasEditRight = await User.findOne({ _id: req.user.userId });
     if(hasEditRight.viewEditLock === "view") {
       return res
         .status(StatusCodes.BAD_REQUEST)
         .json({ msg: "You don't have permission to perform this action. You can only view." });
     }

    const referralData = await Referral.findById(req.body.id);

    if (!referralData) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Referral not found" });
    }

    if(referralData.referral === "") {
      await Referral.findByIdAndUpdate(req.body.id, {
        status: "Pending",
      }, {
        new: true,
      })
    } else {
      await Referral.findByIdAndUpdate(req.body.id, {
        status: "Confirmed",
      }, {
        new: true,
      })
    }
    

    
    res.status(StatusCodes.OK).json({ msg: "updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};


export const getClinicList = async (req, res) => {
  try {
    let clinicNames = [];

    if (req.params.location === "") {
      
      clinicNames = [];
    }

    if (req.params.location === "Delhi") {
      const users = await User.find({ location: "Delhi", role: "user" });
      clinicNames = users.map((user) => user.name);
    }

    if (req.params.location === "Outside Delhi") {
      const users = await User.find({ location: "Outside Delhi", role: "user" });
      clinicNames = users.map((user) => user.name);
    }

    res
      .status(StatusCodes.OK)
      .json({ msg: "return successfully", clinicNames });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};


export const generatePDFCloudinaryArray = async (req, res) => {
  try {

   

    const data = await generatePDFCloudinary(req.body.imageArray, req.body.documentType)
   
    res
      .status(StatusCodes.OK)
      .json({ msg: "return successfully", pdfBuffer: data});
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};