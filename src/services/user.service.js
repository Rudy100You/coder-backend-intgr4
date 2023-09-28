import { hashPassword, isValidPassword } from "../utils/utils.js";

export default class UserService {
  constructor(userRepository)
  {
    this.userRepository = userRepository
  }
  findUserById = async (id) => 
  await this.userRepository.getOne(id);
  findUserByCriteria = async (criteria) =>
  await this.userRepository.getOneByCriteria(criteria);
  createUser = async (user) => 
  await this.userRepository.create(user);
  updateUserPassword = async(userID, password)=>{
    await this.userRepository.update(userID, {password: hashPassword(password)})
  }
  updateUserRole = async(userID, role)=>{
    await this.userRepository.update(userID, {role})
  }
  validateRepeatedPassword = async(userID, password)=>{
    return !isValidPassword(await this.findUserById(userID),password)
  }
  removeSensitiveUserData= (user)=>{
    if(user){
      delete user.password
    }
    return user
  }
}