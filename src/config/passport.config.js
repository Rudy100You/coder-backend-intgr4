import passport from "passport";
import registerStrategy from "./strategies/register.strategy.js";
import loginStrategy from "./strategies/login.strategy.js";
import githubStrategy from "./strategies/github.strategy.js";
import adminManager from "../dao/fileSystem/admin.manager.js";
import UserService from "../services/user.service.js";
import UserRepository from "../dao/repository/user.repository.js";

const userService = new UserService(new UserRepository())

const initializePassport = (clientID, clientSecret) => {

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async(sessionUser, done) => { 
    let user = await adminManager.findAdminByEmail(sessionUser.email)
    if(!user)
      user = await userService.findUserByCriteria({email: sessionUser.email});
    done(null, user);
  });

  passport.use(
    "register",
    registerStrategy()
  );

  passport.use(
    "login",
    loginStrategy()
  );
  passport.use(
    "github",
    githubStrategy(clientID, clientSecret)
  );
};
export default initializePassport;
