import { before, describe, it } from "mocha";

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
    await mongoose.connect(MONGO_URL);
    await mongoose.connection.collections["products"].drop();
    cookies = await getPremiumMockUserCookiesForTest(requester);
  });

  describe("Testing route /api/products/ ", () => {
    it("[POST] Several creation of products should be sucessfull", async function () {
      this.timeout(30000);
      for (let i = 0; i < 15; i++) {
        const res = await requester
          .post("/api/products")
          .set("Cookie", cookies)
          .send(generateProduct());
        expect(res.status).to.be.equal(201);
      }
    });

    it("[GET] Retrieval of products should be sucessfull", async function () {
      const res = await requester.get("/api/products");
      expect(res.status).to.be.equal(200);
    });

    it("[GET] Payload should not return more items than specified limit ", async () => {
      const res = await requester.get("/api/products").query({ limit: 9 });
      expect(res.body.payload.length).to.be.equal(9);
    });
  });
});
