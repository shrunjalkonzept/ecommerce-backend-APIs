const multer = require("multer")
const {
  brandAndCategory: {
    getBrandsAndCategory,
    updateBrandsAndCategory,
    deleteBrandsAndCategory,
    createBrandsAndCategory,
  },
} = require("../controllers")
const { protect } = require("../middleware/authMiddleware.js")
// const { upload } = require("../middleware/imageMIddleware");
const joiSchemas = require("../utils/joiSchemas")
const validateRequest = require("../utils/requestValidator")

const upload = multer({ dest: "/tmp" })
module.exports = (router) => {
  // public routes

  // private Routes
  router
    .route("/:type")
    .get(protect, getBrandsAndCategory)
    .post(protect, upload.single("image"), createBrandsAndCategory)
    .put(protect, upload.single("image"), updateBrandsAndCategory)
    .delete(protect, deleteBrandsAndCategory)
}
