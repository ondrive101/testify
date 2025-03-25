import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  hasUploadSelf: {
    type: Boolean,
    default: false,
  },
  hasUploadNonSelf: {
    type: Boolean,
    default: false,
  },
  daycareIPDLock:{
    type: String,
    default: "true",

  },
  location: {
    type: String,
    default: "Delhi",
  },
  userLock:{
    type: String,
    default: "true",

  },
  viewEditLock:{
    type: String,
    default: "edit",

  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superAdmin'],
    default: 'user',
  },
}, { timestamps: true });

UserSchema.methods.withoutPassword = function () {
  let obj = this.toObject();
  delete obj.password;
  return obj;
};

UserSchema.methods.withoutPasswordEmail = function () {
  let obj = this.toObject();
  delete obj.password;
  delete obj.email;
  return obj;
};
export default mongoose.model('User', UserSchema);
