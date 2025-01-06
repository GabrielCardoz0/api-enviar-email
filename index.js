import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
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
.post("/", async (req, res) => {
  const { email, subject, html } = req.body;

  if(!email || !subject || !html) return res.status(400).send({ message: "Missing required fields", success: false });

  try {
    const info = await transporter.sendMail({
      from: "naoresponda@kumotecnologia.com",
      to: email,
      subject,
      html,
    });

    return res.status(200).send({  info, success: true });
  } catch (error) {
    return res.status(500).send({ error, success: false });
  }
})

app.listen(4545, () => {
  console.log("Server is running on port 4545");
});