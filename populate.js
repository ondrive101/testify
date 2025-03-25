import { readFile } from 'fs/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Therapy from './models/Therapy.js';
import User from './models/User.js';


try {
    await mongoose.connect(process.env.URI);
    const user = await User.findOne({ email: 'vk408727@gmail.com' });
    const jsonTherapy = JSON.parse(
      await readFile(new URL('./utils/mockData.json', import.meta.url))
    );
    const therapies = jsonTherapy.map((therapy) => {
      return { ...therapy, createdBy: user._id };
    });
    await Therapy.deleteMany({ createdBy: user._id });
    await Therapy.create(therapies);
    console.log('Success!!!');
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }