const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    mobileNo: {
      type: Number,
      require: true,
      unique: true,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
      default:null
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema)

module.exports = User
