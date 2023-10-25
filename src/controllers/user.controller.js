import nodemailer from "nodemailer";
import {
  convertPublicLocalFileToURL,
  equalsIgnoreCase,
  validateEmailFormat,
} from "../utils/utils.js";
import { logger } from "../utils/middlewares/logger.handler.js";
import CustomError from "../utils/errors/CustomError.js";
import ErrorTypes from "../utils/errors/ErrorTypes.js";
import fs from "fs";
import path from "path";
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

export default class UserController {
  constructor(userService, resetKeyService) {
    this.userService = userService;
    this.resetKeyService = resetKeyService;
  }
  resetPassword = async (req, res) => {
    const { resetID, newPassword } = req.body;
    const resetKey = await this.resetKeyService.findResetKeyById(resetID);
    if (resetKey) {
      const user = await this.userService.findUserByCriteria({
        email: resetKey.email,
      });
      if (
        await this.userService.validateRepeatedPassword(user._id, newPassword)
      ) {
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
  };

  sendResetEmail = async (req, res) => {
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
  };

  uploadDocuments = async (req, res, next) => {
    try {
      const { uid } = req.params;
      if (!(await this.userService.findUserById(uid)))
        CustomError.throwNewError({
          name: ErrorTypes.INLINE_CUSTOM_ERROR,
          cause: "User not found",
          message: `User [${uid}] does not exist`,
          status: 404,
          customParameters: { entityType: "User", entityID: uid },
        });
      await Object.entries(req.files).forEach(async (entry) => {
        if (fs.existsSync(path))
          CustomError.throwNewError({
            name: ErrorTypes.INLINE_CUSTOM_ERROR,
            cause: `File [${path}] already exists`,
            message: `File [${path}] already exists`,
            status: 400,
            customParameters: { entityType: "File", entityID: path },
          });
        await this.userService.addDocument(
          uid,
          entry[0],
          convertPublicLocalFileToURL(entry[1][0].path)
        );
        return res
          .status(200)
          .send({ status: "Success", message: "User documents added" });
      });
    } catch (error) {
      next(error);
    }
  };

  toggleUserPremiumRole = async (req, res, next) => {
     try {
      const userID = req.params.uid;
    const user = await this.userService.findUserById(userID);

   
      if (user) {
        const prevRole = user.role;
        let newRole = "";
        if (equalsIgnoreCase(user.role, "BASIC")) {
          newRole = "PREMIUM";
          if(!(await this.userService.userIsEligibleForUpgrade(userID)))
          CustomError.throwNewError({
            name: ErrorTypes.INLINE_CUSTOM_ERROR,
            cause: `User has not uploaded enough files for upgrading their account`,
            message: `User ${userID} has not uploaded enough files for upgrading their account`,
            status: 400,
            customParameters: { entityType: "File", entityID: path },
          });
      }
        if (equalsIgnoreCase(user.role, "PREMIUM")) newRole = "BASIC";
        await this.userService.updateUserRole(userID,newRole);
        logger.debug(`User role updated from [${prevRole}] to [${newRole}]`);
        return res.send({
          status: "success",
          message: `User role updated from [${prevRole}] to [${newRole}]`,
        });
      }
      res.status(422).send({ status: "error", message: "Invalid user" });
    } catch (error) {
      next(error)
    }
  };
}
