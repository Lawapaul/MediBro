const nodemailer = require("nodemailer");
const wrapAsync = require("./wrapAsync");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "customdomain.08@gmail.com",
    pass:"uycv cgub jkhj kmqd",
  },
});

module.exports.sendMail = wrapAsync(async (from, to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
});