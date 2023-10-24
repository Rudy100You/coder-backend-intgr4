import { before, describe, it } from "mocha";

import mongoose from "mongoose";
import supertest from "supertest";
import { expect } from "chai";

import {
  MONGO_URL,
  getCartForTest,
  getNonPremiumMockUserCookiesForTest,
  getProductForTest,
  getTestURLForRequester,
} from "../test.utils.js";

const requester = supertest(getTestURLForRequester());

describe("[Carts Router] tests", () => {
  let cookies;

  before(async function () {
    this.timeout(10000);
    await mongoose.connect(MONGO_URL);
    await mongoose.connection.collections["carts"].drop();
    await mongoose.connection.collections["products"].drop();

    cookies = await getNonPremiumMockUserCookiesForTest(requester);
  });

  describe("Testing route /api/carts/", () => {
    it("[POST] Cart should be created successfully", async function () {
      const productMock = await getProductForTest();
      const cartMock = {
        products: [{ product: productMock._id, quantity: 3 }],
      };
      const res = await requester
        .post("/api/carts")
        .set("Cookie", cookies)
        .send(cartMock);
      expect(res.status).to.be.equal(201);
    });

    it("[POST] Request should return status 422 when there is a product ID with invalid format", async () => {
      const cartMock = {
        products: [
          {
            product: "6528671acbcd23754365",
            quantity: 1,
          },
        ],
      };
      const res = await requester
        .post("/api/carts")
        .set("Cookie", cookies)
        .send(cartMock);
      expect(res.status).to.be.equal(422);
    });
  });

  describe("Testing route /api/carts/:cid/product/:pid", () => {
    it("[POST] Product should be added to cart sucessfully and present when checked", async function () {
      this.timeout(15000);
      const cartMock = await getCartForTest();
      const productMock = await getProductForTest();
      await requester
        .post(`/api/carts/${cartMock._id}/product/${productMock._id}`)
        .set("Cookie", cookies)
        .expect(201);

      const res = await requester
        .get(`/api/carts/${cartMock._id}`)
        .set("Cookie", cookies);

      expect(
        res.body.payload.products.filter(
          (p) => p.product && p.product._id == productMock._id.toString()
        )[0].product._id
      ).to.be.equal(productMock._id.toString());
    });
  });
});
