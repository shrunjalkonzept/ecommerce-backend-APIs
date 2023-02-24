const multer = require("multer")
const {
  product: {
    createProduct,
    createProductReview,
    getProductById,
    deleteProduct,
    updateProduct,
    getTopProducts,
    getProducts,
    getRelevantProducts,
  },
} = require("../controllers")
const { protect } = require("../middleware/authMiddleware.js")
const joiSchemas = require("../utils/joiSchemas")
const validateRequest = require("../utils/requestValidator")

const upload = multer({ dest: "/tmp" })

module.exports = (router) => {
  // public routes
  router.get("/product/top", getTopProducts)
  router.get("/product/relevant", getRelevantProducts)

  // private Routes
  router
    .route("/product")
    .get(getProducts)
    .post(protect, upload.array("image"), createProduct)
  router
    .route("/product/:id/reviews")
    .post(
      protect,
      validateRequest(joiSchemas.productId, "query"),
      validateRequest(joiSchemas.createProductReview),
      createProductReview
    )
  router
    .route("/product/:id")
    .get(validateRequest(joiSchemas.productId, "query"), getProductById)
    .delete(
      protect,
      validateRequest(joiSchemas.productId, "query"),
      deleteProduct
    )
    .put(protect, upload.array("image"), updateProduct)
}
