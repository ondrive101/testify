
import { nanoid } from "nanoid";
import Patient from "../models/Patient.js";
import User from "../models/User.js";


export const generateUHID = async (userId) => {
    const initials = {
      "Safdarjung": "SJ",
      "Karol Bagh": "KB",
      "Laxmi Nagar": "LN",
      "Prashant Vihar": "PV",
      "Multan Nagar": "MN",
      "New Friends Colony": "NFC",
      "Shastri Nagar": "SN",
      "Dwarka": "DW",
      "Vaishali": "VA",
      "Rohini": "RO",
      "Noida": "NO",
      "Krishan Kunj": "KK",
      "Old Rajandar Nagar": "ORN",
      "Faridabad": "FB",
      "Rdc": "RDC",
      "Gurugram": "GG",
    };
    const user = await User.findById(userId)
    const documentCount = await Patient.countDocuments({createdBy:userId})
    const random = nanoid(3)
    return `${initials[user.toJSON().clinic]}${documentCount+1}${new Date().getMinutes()}${new Date().getFullYear()}`;
  };
  