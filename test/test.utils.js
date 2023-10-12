import { APP_URL, DATABASE_NAME, MDB_HOST, MDB_PASS, MDB_USER, PORT } from "../src/config/dotenv.config.js";

export const MONGO_URL = `mongodb+srv://${MDB_USER}:${MDB_PASS}@${MDB_HOST}/${DATABASE_NAME}?retryWrites=true&w=majority`;

export const getTestURLForRequester = () => {
   const testUrl =  APP_URL?  `${APP_URL}:8080` :  `http://localhost:${PORT || 4000}`;
   console.log(`Using test url: ${testUrl}`)
   return testUrl
} 
export const getNonPremiumMockUserCookiesForTest =async (requester)=>{
   const mockUserReg = {
      firstName: "Guillermo",
      lastName: "Hernandez",
      birthday: "2000-07-05",
      email: "ghez@gmail.com",
      password: "nordelgang",
   };
   const mockUserLogin = {
      email: "ghez@gmail.com",
      password: "nordelgang",
   };
   try {
      await requester.get("/api/sessions/logout");
      await requester.post("/api/sessions/register").send(mockUserReg);
   } catch (e) {
      console.error(e.message);
   }
   const loginRes = await requester
      .post("/api/sessions/login")
      .send(mockUserLogin);
   return loginRes.headers["set-cookie"];
}
export const getPremiumMockUserCookiesForTest =async (requester)=>{
   const mockUserReg = {
      firstName: "Guillermo",
      lastName: "Hernandez",
      birthday: "2000-07-05",
      email: "ghez2@gmail.com",
      password: "gnagledroN",
      role: "PREMIUM"
   };
   const mockUserLogin = {
      email: "ghez2@gmail.com",
      password: "nordelgang",
   };
   try {
      let r= await requester.get("/api/sessions/logout");
      r = await requester.post("/api/sessions/register").send(mockUserReg);
      console.log("")
   } catch (e) {
      console.error(e.message);
   }
   const loginRes = await requester
      .post("/api/sessions/login")
      .send(mockUserLogin);
   return loginRes.headers["set-cookie"];
}