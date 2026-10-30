 // create transporter
 import nodemailer from "nodemailer";
import {config} from "dotenv";
 import {env} from "../config/env.js";



 // establish connection with Gmail
 const transporter = nodemailer.createTransport({
     host: "smtp.gmail.com",
     port: 587,
     secure: false,
     auth: {
         user: env.nodemailer.user,
         pass: env.nodemailer.password
     }
 });

export async function sendEmail(to, subject, html) {

    await transporter.sendMail({
        from: `"NGL-APP" <${env.nodemailer.user}>`,
        to: to,
        subject: subject,
        html: html
    })
}