import 'express-async-errors';

import * as dotenv from 'dotenv';
dotenv.config();


import express from 'express';
const app = express();



import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import status from "express-status-monitor"


import cloudinary from 'cloudinary';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors'; // Import the cors package
//router
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import referralRouter from './routes/referralRouter.js';
import dispensaryRouter from './routes/dispensaryRouter.js';



// public
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';





// middleware
import errorHandlerMiddleware from './middleware/errorHanderMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
app.use(express.static(path.resolve(__dirname, './client/dist')));

app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());

app.use(status())



// Enable CORS with custom settings
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', // Restrict to specific domains if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Configure additional CSP through Helmet if needed
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust as per your needs
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", 'data:', 'blob:', 'res.cloudinary.com'], // Allow images from Cloudinary
    connectSrc: ["'self'", process.env.ALLOWED_ORIGINS?.split(',') || '*'],
    fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}));




app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/referral', authenticateUser, referralRouter);
app.use('/api/v1/dispensary', authenticateUser, dispensaryRouter);




app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'));
});



app.use('*', (req, res) => {
    res.status(404).json({ msg: 'not found' });
});


app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5100;

try {
  await mongoose.connect(process.env.URI);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}...`);
  });
} catch (error) {
  console.log(error); 
  process.exit(1);
}                   