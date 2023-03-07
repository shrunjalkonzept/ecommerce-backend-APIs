const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const { uniqueNamesGenerator, names } = require("unique-names-generator")
const jwt = require("jsonwebtoken")

const generateToken = require("../utils/generateToken.js")
const User = require("../models/userModel.js")
const { sendOtpToMobile, generateOTP } = require("../utils/smsService.js")
const expressAsyncHandler = require("express-async-handler")
const { countCartTotal } = require("../utils/productUtills.js")
const Product = require("../models/productModel.js")
const { forEach, map } = require("lodash")
const saltRounds = 10

// @desc    Auth user & get OTP
// @route   POST /api/user/generate-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body

  let existUser = null
  const otp = 987654
  existUser = await User.findOne({ mobileNo })

  if (!existUser) {
    // create new user if not found
    existUser = await User.create({
      mobileNo,
    })
  }

  if (existUser) {
    existUser.otp = otp
    await existUser.save()
    await sendOtpToMobile(mobileNo, otp)
    res.status(200).json({
      otp,
      message: "OTP sent successfully",
    })
  } else {
    res.status(401)
    throw new Error("something went wrong")
  }
})

// @desc    verify OTP
// @route   POST /api/user/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { mobileNo, otp, resetPass } = req.body
  const existUser = await User.findOne({ mobileNo }).select(["-password"])
  const expiresIn = resetPass ? 12000 : "30d"

  if (existUser && existUser.otp === otp) {
    existUser.mobileVerified = true
    existUser.otp = null
    await existUser.save()

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: generateToken(existUser._id, expiresIn),
      user: existUser,
      resetPass,
    })
  } else {
    res.status(400)
    throw new Error("Invalid OTP")
  }
})

// @desc   resetUserDetails
// @route   POST /api/user/reset-password
// @access  public
const resetUserPassword = expressAsyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findById(decoded.id)
  const salt = await bcrypt.genSalt(saltRounds)
  const passwordHash = await bcrypt.hash(password, salt)

  if (decoded && decoded.id) {
    if (user) {
      user.password = passwordHash
      await user.save()
      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      })
    } else {
      res.status(400)
      throw new Error("user either blocked or not available")
    }
  } else {
    res.status(401)
    throw new Error("Token Expired")
  }
})

// @desc   resetUserDetails
// @route   PUT /api/user/reset-password
// @access  Private
const changePassword = expressAsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const { user } = req

  const existUser = await User.findById(user.id)
  const ismatch = await bcrypt.compare(oldPassword, existUser.password)

  if (ismatch) {
    const salt = await bcrypt.genSalt(saltRounds)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    existUser.password = passwordHash
    await existUser.save()
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } else {
    res.status(400)
    throw new Error("wrong old password")
  }
})

// @desc   auth user
// @route   POST /api/user/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { mobileNo, password } = req.body

  const user = await User.findOne({ mobileNo })

  if (user) {
    const ismatch = await bcrypt.compare(password, user.password)
    if (ismatch) {
      res.json({
        _id: user._id,
        success: true,
      })
    } else {
      res.status(400).send({ message: "invalid password" })
    }
  } else {
    res.status(401)
    throw new Error("Invalid number or password")
  }
})

// @desc   register user
// @route   POST /api/user/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { password, mobileNo } = req.body

  const salt = await bcrypt.genSalt(saltRounds)
  const passwordHash = await bcrypt.hash(password, salt)

  const user = await User.findOne({ mobileNo })
  if (user) {
    res.status(400).send("number is already registered")
  } else {
    const newUser = await User.create({
      password: passwordHash,
      mobileNo,
    })

    if (newUser) {
      const accessToken = generateToken(newUser._id)
      res.status(201).send({ success: true, accessToken })
    } else {
      res.status(400).send({ message: "something went wrong" })
    }
  }
})

// @desc   getUserDetails
// @route   GET /api/user/profile
// @access  Protected
const getUserDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const user = await User.findById(_id)
    .populate("cart.products.value", ["mrp", "price", "image"])
    .populate("wishList", ["mrp", "price", "image"])
  if (user) {
    res.status(200).send(user)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
  ;/user/
})

// @desc   getUserDetails
// @route   GET /api/user/profile
// @access  Protected
const updateUserDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user

  const user = await User.findOneAndUpdate({ _id }, req.body, { new: true })
    .populate("cart.products.value", ["mrp", "price", "image"])
    .populate("wishList", ["mrp", "price", "image"])
  if (user) {
    res
      .status(200)
      .send({ data: user, message: "profile updated successfully" })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc   add product to cart
// @route   GET /api/user/cart/:productId
// @access  Protected
const addProductToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const {
    user: { _id },
  } = req

  const userCart = await User.findById(_id).populate("cart.products.value", [
    "mrp",
    "price",
  ])
  if (userCart) {
    const product = await Product.findById(productId).select([
      "mrp",
      "price",
      "image",
    ])
    const {
      cart: { products },
    } = userCart
    if (product) {
      let list = products || []

      list.push({
        value: { _id: product._id, mrp: product.mrp, price: product.price },
        qty: 1,
        new: true,
      })
      const cart = countCartTotal(list)
      const updatedCart = await User.findOneAndUpdate(
        { _id },
        { $set: { cart } },
        { new: true }
      )
        .populate("cart.products.value", ["mrp", "price", "image"])
        .select({ cart: 1 })
      if (updatedCart) {
        res
          .status(200)
          .send({ data: updatedCart, message: "Item added to cart" })
        res.status(400)
        throw new Error("something went wrong")
      }
    } else {
      res.status(400)
      throw new Error("product not found")
    }
  } else {
    res.status(400)
    throw new Error("userCart not found")
  }
})

// @desc   remove product to cart
// @route   PUT /api/user/cart/:productId
// @access  Protected
const removeProductFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const {
    user: { _id },
  } = req

  const userCart = await User.findById(_id)
    .populate("cart.products.value", ["mrp", "price", "image"])
    .select({ cart: 1 })
  if (userCart) {
    const {
      cart: { products },
    } = userCart

    if (products.length) {
      const product = await Product.findById(productId)
      if (product) {
        forEach(products, (product) => {
          const {
            value: { _id },
          } = product
          if (_id.toString() === productId && product.qty > 0)
            product.qty = product.qty - 1

          return product
        })
        const cart = countCartTotal(products)
        const updatedCart = await User.findOneAndUpdate(
          { _id },
          { $set: { cart } },
          { new: true }
        )
          .populate("cart.products.value", ["mrp", "price", "image"])
          .select({ cart: 1 })
        if (updatedCart) {
          res
            .status(200)
            .send({ data: updatedCart, message: "Item removed from cart" })
        } else {
          res.status(400)
          throw new Error("something went wrong")
        }
      } else {
        res.status(400)
        throw new Error("product not found")
      }
    } else {
      res.status(400)
      throw new Error("cart is empty")
    }
  } else {
    res.status(400)
    throw new Error("userCart not found")
  }
})

// @desc   add product to Wishlist
// @route   POST /api/user/cart/:productId
// @access  Protected
const addProductToWishList = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { _id } = req.user
  const user = await User.findById(_id)
  if (user) {
    const { wishList } = user
    console.log({ wishList })
    const newWishList = wishList ?? []
    // check if product is already in list or not
    const idExist = newWishList.find((pid) => pid.toString() === productId)
    if (idExist) {
      res.status(400)
      throw new Error("product Already in Wishlist")
    } else {
      newWishList.push(productId)
      const response = await User.findOneAndUpdate(
        { _id },
        { $set: { wishList: newWishList } },
        { new: true }
      )
        .populate("wishList", [
          "name",
          "price",
          "mrp",
          "rating",
          "image",
          "description",
        ])
        .select("wishlist")
      res
        .status(200)
        .send({ data: response, message: "product added to wishlist" })
    }
  } else {
    res.status(400)
    throw new Error("user not found")
  }
})

// @desc   remove product from Wishlist
// @route   PUT /api/user/cart/:productId
// @access  Protected
const removeProductFromWishList = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { _id } = req.user
  const user = await User.findById(_id)
  if (user) {
    const { wishList } = user
    let newWishList = wishList ?? []
    newWishList = newWishList.filter((pid) => pid.toString() !== productId)
    const response = await User.findOneAndUpdate(
      { _id },
      { $set: { wishList: newWishList } },
      { new: true }
    )
      .populate("wishList", [
        "name",
        "price",
        "mrp",
        "rating",
        "image",
        "description",
      ])
      .select("wishlist")
    res
      .status(200)
      .send({ data: response, message: "product removed from wishlist" })
  } else {
    res.status(400)
    throw new Error("user not found")
  }
})

module.exports = {
  sendOTP,
  verifyOTP,
  getUserDetails,
  registerUser,
  authUser,
  resetUserPassword,
  changePassword,
  addProductToCart,
  addProductToWishList,
  removeProductFromWishList,
  removeProductFromCart,
  updateUserDetails,
}
