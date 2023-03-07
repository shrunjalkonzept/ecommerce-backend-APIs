const {
  user: {
    sendOTP,
    verifyOTP,
    getUserDetails,
    registerUser,
    authUser,
    changePassword,
    resetUserPassword,
    addProductToCart,
    removeProductFromCart,
    addProductToWishList,
    removeProductFromWishList,
    updateUserDetails,
  },
} = require("../controllers")
const { protect, admin } = require("../middleware/authMiddleware.js")
const joiSchemas = require("../utils/joiSchemas")
const validateRequest = require("../utils/requestValidator")

module.exports = (router) => {
  // public routes
  router
    .route("/user/generate-otp")
    .post(validateRequest(joiSchemas.generateOTP), sendOTP)
  router
    .route("/user/verify-otp")
    .post(validateRequest(joiSchemas.verifyOTP), verifyOTP)
  router
    .route("/user/register")
    .post(validateRequest(joiSchemas.auth), registerUser)
  router.route("/user/login").post(validateRequest(joiSchemas.auth), authUser)
  router.route("/user/password/:token").post(resetUserPassword)

  // private Routes
  router
    .route("/user/profile")
    .get(protect, getUserDetails)
    .post(protect, updateUserDetails)
  router.route("/user/password").put(protect, changePassword)
  router
    .route("/user/cart/:productId")
    .post(protect, addProductToCart)
    .put(protect, removeProductFromCart)
  router
    .route("/user/wishlist/:productId")
    .post(protect, addProductToWishList)
    .put(protect, removeProductFromWishList)
}
