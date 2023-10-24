import { before, describe, it } from "mocha";

import mongoose from "mongoose";
import supertest from "supertest";
import { expect } from "chai";

import { MONGO_URL, getTestURLForRequester } from "../test.utils.js";

const requester = supertest(getTestURLForRequester());

describe("[Sessions Router] tests", () => {
  let cookies;

  before(async function () {
    this.timeout(10000);
    await mongoose.connect(MONGO_URL);
    await mongoose.connection.collections["users"].drop();
  });

  describe("Testing route /api/sessions/register", () => {
    const mockUserReg = {
      firstName: "Guillermo",
      lastName: "Hernandez",
      birthday: "2000-07-05",
      email: "ghez@gmail.com",
      password: "nordelgang",
    };
    it("[POST] User should be created successfully", async function () {
      const res = await requester
        .post("/api/sessions/register")
        .send(mockUserReg);
      expect(res.status).to.be.equal(201);
    });
  });

  describe("Testing route /api/sessions/login", () => {
    const mockUserLogin = {
      email: "ghez@gmail.com",
      password: "nordelgang",
    };
    let res;

    it("[POST] User login should be successful", async function () {
      res = await requester.post("/api/sessions/login").send(mockUserLogin);
      cookies = res.headers["set-cookie"][0];
      expect(res.status).to.be.equal(200);
    });
    it("[POST] Cookie should be introduced in set-cookie header", async function () {
      expect(cookies).to.not.be.null;
    });
    
  });
});
