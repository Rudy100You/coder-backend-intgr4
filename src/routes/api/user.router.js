import ResetKeyService from "../../services/resetKey.service.js";
import ResetKeyRepository from "../../dao/repository/resetKey.repository.js";
import UserService from "../../services/user.service.js";
import UserRepository from "../../dao/repository/user.repository.js";
import { Router } from "express";
import UserController from "../../controllers/user.controller.js";
import uploader, { handledUploadFields } from "../../utils/middlewares/multer.uploader.js";

const usersRouter = Router();

const userController = new UserController( new UserService(new UserRepository()), new ResetKeyService(new ResetKeyRepository()));
usersRouter.post("/:uid/documents",uploader.fields(handledUploadFields), userController.uploadDocuments);

usersRouter.post("/reset-password", userController.resetPassword);

usersRouter.post("/reset-password/send-email", userController.sendResetEmail);

usersRouter.get("/premium/:uid", userController.toggleUserPremiumRole);

export default usersRouter;
