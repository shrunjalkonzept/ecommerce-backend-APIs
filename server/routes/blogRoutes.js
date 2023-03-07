const multer = require("multer")
const {
  getBlogs,
  updateBlog,
  createBlog,
  deleteBlogById,
  getBlogById,
} = require("../controllers/blogControllers")
const { protect } = require("../middleware/authMiddleware")
const upload = multer({ dest: "/tmp" })

module.exports = (router) => {
  // public routes

  //   private routes
  router
    .route("/blog")
    .get(getBlogs)
    .post(protect, upload.single("image"), createBlog)
  router
    .route("/blog/:blogId")
    .get(getBlogById)
    .put(protect, upload.single("image"), updateBlog)
    .delete(protect, deleteBlogById)
}
