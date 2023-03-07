const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "GymCart",
    },
    lastName: { type: String, default: "User" },
    Description: { type: String, default: "" },
    email: {
      type: String,
      default: "",
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
    cart: {
      products: [
        {
          value: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          qty: {
            type: Number,
            default: 0,
          },
        },
      ],
      subTotal: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    otp: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema)

module.exports = User
