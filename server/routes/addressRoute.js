const {
  getUserAddresses,
  addAddress,
  getAddAddressById,
  updateAddressById,
  deleteAddressById,
} = require("../controllers/addressController")
const { protect } = require("../middleware/authMiddleware")

module.exports = (router) => {
  // public routes

  //   private routes
  router
    .route("/address")
    .get(protect, getUserAddresses)
    .post(protect, addAddress)
  router
    .route("/address/:id")
    .get(protect, getAddAddressById)
    .put(protect, updateAddressById)
    .delete(protect, deleteAddressById)
}
