import { Router } from "express";

import { currentUserHasProductManipulationPrivileges, validateSession } from "../../utils/middlewares/session.validations.js";
import ProductController from "../../controllers/product.controller.js";
import ProductService from "../../services/product.service.js";
import ProductRepository from "../../dao/repository/product.repository.js";
const productsRouter = Router();

const productController = new ProductController(new ProductService(new ProductRepository()))

productsRouter.get("/", productController.getAllProducts);
productsRouter.get("/:pid", productController.getProduct);

productsRouter.use(validateSession)
productsRouter.post("/",currentUserHasProductManipulationPrivileges, productController.createProduct);
productsRouter.put("/:pid",currentUserHasProductManipulationPrivileges,productController.updateProductData);
productsRouter.delete("/:pid",currentUserHasProductManipulationPrivileges,productController.deleteProduct);

export default productsRouter;