const multer = require("multer")
const {
  getOffer,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} = require("../controllers/offerController")
const { protect } = require("../middleware/authMiddleware")
const upload = multer({ dest: "/tmp" })

module.exports = (router) => {
  // public routes

  //private routes
  router
    .route("/offer")
    .get(protect, getOffer)
    .post(protect, upload.single("image"), createOffer)
  router
    .route("/offer/:_id")
    .get(protect, getOfferById)
    .put(protect, upload.single("image"), updateOffer)
    .delete(protect, deleteOffer)
}
