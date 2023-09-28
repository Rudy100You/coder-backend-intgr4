import ResetKeyRepository from "../../dao/repository/resetKey.repository.js";
import ResetKeyService from "../../services/resetKey.service.js";
import CustomError from "../errors/CustomError.js";
import ErrorTypes from "../errors/ErrorTypes.js";
import { equalsIgnoreCase } from "../utils.js";

const allRoles = ["BASIC","ADMIN", "PREMIUM"]
const productManipulationPrivlegesRoles = ["ADMIN", "PREMIUM"]

const resetKeyService = new ResetKeyService(new ResetKeyRepository());

const isAPIrequest = (req)=>{
  return req.baseUrl.includes('/api')
}

const isValidRole= (currentUserRole)=> allRoles.some((role)=>equalsIgnoreCase(currentUserRole,role))

export const validateSession = (req, res, next) => {
    if (req.isAuthenticated()) {
      // Session is valid, proceed to the next middleware or route handler
      next();
    } else {
      // Session is not valid or not present, redirect to login page or return an error
      res.redirect("/login");
    }
  };
  
export const validateSessionAfterLogin = (req, res, next) => {
if (req.isAuthenticated()) {
    res.redirect("/profile");
} else {
    // Session is not valid or not present, redirect to login page or return an error
    next();
}
};

export const currentUserIsAdmin = (req, res, next) => {
    if (req.isAuthenticated() && equalsIgnoreCase(req.user.role, "ADMIN")) {
      next();
  } else {
    if(isAPIrequest)
      CustomError.throwNewError({name: ErrorTypes.USER_NOT_ALLOWED_ERROR})
    return res.redirect("/error");
  }
}

export const currentUserHasProductManipulationPrivileges = (req, res, next) => {
  if (req.isAuthenticated() && isValidRole(req.user.role) && productManipulationPrivlegesRoles.some((role)=>equalsIgnoreCase(req.user.role,role))) {
    next();
} else {
  if(isAPIrequest)
    CustomError.throwNewError({name: ErrorTypes.USER_NOT_ALLOWED_ERROR})
  return res.redirect("/error");
}
}

export const currentUserCanHaveCarts = (req, res, next) => {
  if (req.isAuthenticated() && isValidRole(req.user.role) && !equalsIgnoreCase("ADMIN")){
    next();
} else {
    if(isAPIrequest)
      CustomError.throwNewError({name: ErrorTypes.USER_NOT_ALLOWED_ERROR})
    return res.redirect("/error");
}
}

export const validateResetKey= async(req,res,next)=>{
  const redirectPath = "/users/reset-password?invalid_or_expired_resetid=true";
  try{
    if( resetKeyService.existsByCriteria({_id:req.params.rpid}))
    next()
  else
    res.redirect(redirectPath)
  }catch(err)
  {
    if(err.name === "CastError")
      return res.redirect(redirectPath)
    CustomError.throwNewError()
  }
}