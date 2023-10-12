import { after, before, describe, it } from "mocha";

import mongoose from "mongoose";
import supertest from "supertest";
import { expect } from "chai";

import {
  MONGO_URL,
  getPremiumMockUserCookiesForTest,
  getTestURLForRequester,
} from "../test.utils.js";
import { generateProduct } from "../../src/utils/mock.generators.js";

const requester = supertest(getTestURLForRequester());

describe("[Products router] tests", () => {
  let cookies;

  before(async function () {
    this.timeout(10000);
    mongoose.connect(MONGO_URL);
    cookies = await getPremiumMockUserCookiesForTest(requester);

  });

  describe("Testing route / ", () => {
    it("[POST] Several creation of products should be sucessfull", async()=>{
        for(let i =0; i < 30; i++){
            const res = await (await requester.post("/api/products").set("Cookie", cookies).send(generateProduct()))
            expect(res.status).to.be.equal(200)
        }
           
    })

    it("[GET] Retrieval of products should be sucessfull", async function () {
      const res = await requester.get("/api/products")
      expect(res.status).to.be.equal(200);
    });

    it("[GET] Payload should not return more items than specified limit ", async () => {
      const res = await requester
        .get("/api/products").field("limit",9)
      expect(res.body.payload.length).to.be.equal(9);
    });
  });

  after(async function () {
    this.timeout(10000);
    if(await mongoose.connection.collections["products"])
    mongoose.connection.collections["products"].drop();
  });
});
