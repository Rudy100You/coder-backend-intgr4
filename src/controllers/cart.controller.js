import CustomError from "../utils/errors/CustomError.js";
import ErrorTypes from "../utils/errors/ErrorTypes.js";
import { generateNotFoundEntityDescription, generateUserCanNotAddOwnedProductDescription } from "../utils/errors/errorDescriptions.js";
import { equalsIgnoreCase } from "../utils/utils.js";

export default class CartController {
  constructor(cartService, productService) {
    this.cartService = cartService;
    this.productService = productService;
  }
  validateProducts = async (products,user) => {
    if (products.length > 0) {
      for (const product of products) {
        await this.validateProduct(product.product,user);
      }
    }};

  validateProduct = async (product, user) => {
    await this.productService
      .existsByCriteria({ _id: product })
      .then(async (exists) => {
        if (!exists) {
          CustomError.throwNewError({
            error: ErrorTypes.ENTITY_DOES_NOT_EXIST_ERROR,
            cause: generateNotFoundEntityDescription("Product"),
            message: "Provided product does not exist",
            customParameters: { entity: "Product", entityID: product },
          });
        }
        if(product.owner === user.email && equalsIgnoreCase("PREMIUM", user.role) ){
          CustomError.throwNewError({
            error: ErrorTypes.USER_NOT_ALLOWED_ERROR,
            cause: generateUserCanNotAddOwnedProductDescription(user, product),
            message: "Can not add own products to cart"
          });
        }
      })
  }

  getCart = async (req, res) => {
    let cartID = req.params.cid;
    try {
      const cart = await this.cartService.getOne(cartID);
      res.json({ status: "success", payload: cart });
    } catch (err) {
      err.notFoundEntity = "Cart";
      throw err;
    }
  };

  createCart = async (req, res) => {
    const newCart = req.body ?? { products: [] };
    await this.validateProducts(newCart.products);
    await this.cartService.createCart(newCart);
    res
      .status(201)
      .json({ status: "success", payload: "Cart created successfully" });
  };

  insertCartProduct = async (req, res) => {
    const { cid, pid } = req.params;
    await this.validateProduct(pid);
    await this.cartService.insertCartProducts(cid, pid);
    res
      .status(201)
      .json({ status: "success", payload: "Product inserted successfully" });
  };

  deleteCartProduct = async (req, res) => {
    const { cid, pid } = req.params;
    await this.cartService.removeFromCart(cid, pid);
    res
      .status(200)
      .json({ status: "success", payload: "Product deleted successfully" });
  };

  updateEntireCart = async (req, res) => {
    const { cid } = req.params;
    const cart = req.body;
    await this.validateProducts(cart.products);
    await this.cartService.updateCart(cid, cart);
    res.status(200).json({
      status: "success",
      payload: "product list updated successfully",
    });
  };

  updateCartProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (!isNaN(quantity)) {
      await this.cartService.addQuantityToProduct(cid, pid, quantity);
      res
        .status(200)
        .json({ status: "success", payload: "Product deleted successfully" });
    } else {
      let err = new Error("field [quantity] passed and must be a number");
      err.status = 422;
      throw err;
    }
  };

  deleteAllProductsFromCart = async (req, res) => {
    const { cid } = req.params;
    await this.cartService.deleteAllProductsFromCart(cid);
    res.status(200).json({
      status: "success",
      payload: "All products removed from cart successfully",
    });
  };

  finalizePurchase = async (req, res) => {
    const { cid } = req.params;
    const productsWithoutStock = await this.cartService.finalizePurchase(
      cid,
      req.user.email
    );

    if (productsWithoutStock.length > 0) {
      res.status(409).json({
        status: "failure",
        message: "Purchse has products with no stock",
        payload: { products: productsWithoutStock },
      });
    } else {
      res.status(200).json({
        status: "success",
        payload: "Purchse finished sucessfully",
      });
    }
  };
}
