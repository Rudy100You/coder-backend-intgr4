import { after, before, describe, it } from "mocha";

import mongoose from "mongoose";
import supertest from "supertest";
import { expect } from "chai";

import { MONGO_URL, getNonPremiumMockUserCookiesForTest, getTestURLForRequester } from "../test.utils.js";

const requester = supertest(getTestURLForRequester());

describe("[Carts Router] tests", () => {

  let cookies;

  before(async function () {
    this.timeout(10000);
    mongoose.connect(MONGO_URL);
    cookies = await getNonPremiumMockUserCookiesForTest(requester)

    });

  it("[POST] /api/carts - Cart should be created successfully", async function () {
    const cartMock = {
      products: [{ product: "6528671acbc1e8d237543365", quantity: 3 }],
    };
    const res = await requester
      .post("/api/carts")
      .set("Cookie", cookies)
      .send(cartMock);
    expect(res.status).to.be.equal(201);
  });

  it("[POST] /api/carts - Request should return status 422 when there is a product ID with invalid format",async()=>{
    const cartMock = {
        "products": [
            {
                "product": "6528671acbcd23754365",
                "quantity": 1
            }
        ]
    }

    const res = await requester
      .post("/api/carts")
      .set("Cookie", cookies)
      .send(cartMock);
    expect(res.status).to.be.equal(422);
  })



  after(async function (){
    this.timeout(10000);
    if(await mongoose.connection.collections["carts"])
    mongoose.connection.collections["carts"].drop();
  })

});
