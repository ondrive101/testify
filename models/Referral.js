import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    refNumber: Number,
    panel: String,
    uhid: String,
    cardNo: String,
    name: String,
    contact: String,
    patientType: String,
    referralType: String,
    card: String,
    cardPublicId: String,
    prescription: String,
    prescriptionPublicId: String,
    referral: {
      type: String,
      default: "",
    },
    referralPublicId: {
      type: String,
      default: "",
    },

    createdByName: String,
    treatmentType: String,
   

    dispensary: {
      type: String,
      default: "",
    },
    deliveryStatus: {
      type: String,
      default: "Not Delivered",
    },
    deliveryDate: {
      type: Date,
      default: "",
    },
    dispensaryDoctor: {
      type: String,
      default: "",
    },
    referralDate: {
      type: Date,
      default: "",
    },
    location: String,
    status: String,
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

export default mongoose.model("Referral", ReferralSchema);
