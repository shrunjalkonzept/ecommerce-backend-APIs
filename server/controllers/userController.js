const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const { uniqueNamesGenerator, names } = require("unique-names-generator")
const jwt = require("jsonwebtoken")

const generateToken = require("../utils/generateToken.js")
const User = require("../models/userModel.js")
const { sendOtpToMobile, generateOTP } = require("../utils/smsService.js")
const expressAsyncHandler = require("express-async-handler")
const saltRounds = 10

// @desc    Auth user & get OTP
// @route   POST /api/users/generate-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body

  let existUser = null
  const otp = 987654
  existUser = await User.findOne({ mobileNo })

  if (!existUser) {
    // create new user if not found
    existUser = await User.create({
      name: uniqueNamesGenerator({ dictionaries: [names] }),
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
// @route   POST /api/users/verify-otp
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
// @route   POST /api/users/reset-password
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
// @route   PUT /api/users/reset-password
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
// @route   POST /api/users/login
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
// @route   POST /api/users/register
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
      name: uniqueNamesGenerator({ dictionaries: [names] }),
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
// @route   POST /api/users/profile
// @access  Protected
const getUserDetails = asyncHandler(async (req, res) => {
  const { user } = req
  if (user) res.status(200).json(user)
  else {
    res.status(404)
    throw new Error("User not found")
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
}
