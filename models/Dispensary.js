import mongoose from "mongoose";

const dispensarySchema = new mongoose.Schema(
  {
    dispensaryName: String,
    dispensaryDoctor: {
        type: Array,
        default: [],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

export default mongoose.model("dispensary", dispensarySchema);
