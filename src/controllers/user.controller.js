import nodemailer from "nodemailer";
import { equalsIgnoreCase, validateEmailFormat } from "../utils/utils.js";
import { logger } from "../utils/middlewares/logger.handler.js";
const { APP_URL, GOOGLE_APPKEY, GOOGLE_MAIL_SENDER } = process.env;

//TODO: Move mail handling to a service, Improve response and error control
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: GOOGLE_MAIL_SENDER,
    pass: GOOGLE_APPKEY,
  },
});

export default class UserController{
  constructor(userService, resetKeyService)
  {
    this.userService = userService
    this.resetKeyService = resetKeyService;
  }
  resetPassword = async (req, res) => {
    const { resetID, newPassword } = req.body;
    const resetKey = await this.resetKeyService.findResetKeyById(resetID);
    if (resetKey) {
      const user = await this.userService.findUserByCriteria({
        email: resetKey.email,
      });
      if (await this.userService.validateRepeatedPassword(user._id, newPassword)) {
        await this.userService.updateUserPassword(user._id, newPassword);
        await this.resetKeyService.deleteResetKey(resetID);
  
        if (req.user) req.session.destroy();
  
        return res.send({
          status: "success",
          message: "Password was sucessfully changed",
        });
      }
      return res.status(400).send({
        status: "error",
        message: "Provided password is the same. Try Again.",
      });
    }
    return res
      .status(403)
      .send({ status: "error", message: "Reset key is expired or invalid" });
  }

  sendResetEmail =  async (req, res) => {
    const { email } = req.body;
  
    if (validateEmailFormat(email)) {
      mailTransport.sendMail({
        from: `RS CODER <${GOOGLE_MAIL_SENDER}>`,
        to: email,
        subject: `Reset your password`,
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password Email</title>
          <!-- Include Bootstrap CSS from a CDN -->
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.5.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="container">
            <div class="row">
              <div class="col">
                <h1>Password Reset</h1>
                <img src="https://i.imgflip.com/6fh55g.jpg" alt="no-password-megamind" height = "300"></img>
                <p>Hello,</p>
                <p>You've requested a password reset for your account. To reset your password, click the button below:</p>
                <a href="${
                  (APP_URL || "http://localhost:4000") +
                  `/users/reset-password/${
                    (await this.resetKeyService.createResetKey(email))._id
                  }`
                }">
                  <button class="btn btn-primary">Reset Password</button>
                </a>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                <br>
                <p>Thank you!</p>
                <br>
                <p>RS CODER Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
        `,
      });
      res
        .status(200)
        .send({ status: "success", message: "Email sent sucessfully" });
    } else {
      res.status(422).send({ status: "error", message: "Invalid email" });
    }
  }

  toggleUserPremiumRole = async (req,res)=>{
    const userID = req.uid;
    const user = await this.userService.findUserById(userID)

    if(user)
    {
      const prevRole = user.role;
      let newRole = ""
      if(equalsIgnoreCase(user.role, "BASIC"))
        newRole = "PREMIUM"
      if(equalsIgnoreCase(user.role, "PREMIUM"))
        newRole = "BASIC"
      await this.userService.updateUserRole(newRole)
      logger.debug(`User role updated from [${prevRole}] to [${newRole}]`)
      return res.send({ status: "success", message: `User role updated from [${prevRole}] to [${newRole}]` })
    }
    res.status(422).send({ status: "error", message: "Invalid user" });
  }
}
