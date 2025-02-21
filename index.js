import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { upload } from "./multer.js";
import fs from "fs";

dotenv.config();

const app = express();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app
.use(express.json())
.use(cors())
.get("/health", (req, res) => res.status(200).send({ message: "Server is running", success: true }))
.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if(!token || token !== process.env.TOKEN_SECRET) return res.status(401).send({ message: "Access Denied", success: false });

    next();
  } catch (error) {
    return res.status(401).send({ message: "Access Denied", success: false });
  }
})

.post("/", upload.any(), async (req, res) => {
  // console.log(req.body, req.files);

  try {
    const { email, subject, html } = req.body;

    if (!email || !subject || !html) return res.status(400).send({
      message: "Missing required fields",
      success: false
    });

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    }));

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html,
      attachments,
    });

    return res.status(200).send({ email, subject, html, success: true, info });
  } catch (error) {
    console.log(error);

    return res.status(400).send({ message: error.message, success: false });

  } finally {
    req.files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Error deleting file ${file.path}:`, err);
        } else {
          console.log(`Successfully deleted file ${file.path}`);
        }
      });
    });
    
    console.log('FIM');
  }
})

app.listen(4545, () => {
  console.log("Server is running on port 4545");
});