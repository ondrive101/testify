import Opd from "../models/Opd.js";
import Patient from "../models/Patient.js";
import puppeteer from "puppeteer";
import hbs from "handlebars";
import fs from "fs-extra";
import path from "path";
import day from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import { convertAmountToWords } from "./numbertowords.js";

day.extend(advancedFormat);

const compile = async (template, data) => {
  const filePath = path.join(process.cwd(), "views", `${template}.hbs`);
  const html = await fs.readFile(filePath, "utf-8");
  return hbs.compile(html)(data);
};

const logoPath = path.join(process.cwd(), "images", "logo.png");
const logoBuffer = await fs.readFile(logoPath);
const logoBase64 = Buffer.from(logoBuffer).toString("base64");

export const generateOpdInvoiceBase64 = async (patientId) => {
  
  const opd = await Opd.findById({ _id: patientId }).lean();
  const patient = await Patient.findById(opd.patientBy).lean();

  const { name, family, address, gender, beneId, uhid, state } = patient;
  const { opdNumber, createdAt, invoiceNumber, medicine, amount } = opd;
  const amountinwords = convertAmountToWords(amount)
  const updatedMedicine = medicine.map((item, index) => {
    return {...item, serial: index + 1};
  });

const formatedDate = day(createdAt).format("DD-MMM-YYYY");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const content = await compile("main", {
    opd: { opdNumber, formatedDate, invoiceNumber, updatedMedicine, amount, amountinwords },
    patient: { name, family, address, gender, beneId, uhid, state },
    logoBase64,
  });
  await page.setContent(content);
  const pdf = await page.pdf({
    path: "temp.pdf",
    format: "A4",
    printBackground: true,
  });

  return Buffer.from(pdf).toString("base64");
};
        