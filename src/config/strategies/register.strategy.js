import { Strategy } from "passport-local";
import { hashPassword } from "../../utils/utils.js";
import UserService from "../../services/user.service.js";
import { logger } from "../../utils/middlewares/logger.handler.js";
import UserRepository from "../../dao/repository/user.repository.js";

const userService = new UserService(new UserRepository())


export default ()=> new Strategy(
    {
      passReqToCallback: true,

      usernameField: "email",
    },
    async (req, username, password, done) => {
      const { firstName, lastName, email, birthday } = req.body;

      try {
        const user = await userService.findUserByCriteria({email }); 
        if (user) {
          logger.warn("User already exists");
          return done(null, false);
        }

        const newUser = {
          firstName,
          lastName,
          email,
          birthday,
          password: hashPassword(password),
        };
        const result = await userService.createUser(newUser);
        return done(null, result);
      } catch (error) {
        return done("UserError", error);
      }
    }
  )