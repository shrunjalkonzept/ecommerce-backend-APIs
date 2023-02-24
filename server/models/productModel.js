const mongoose = require("mongoose")

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    image: [],
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sellerInformation: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    flavour: {
      type: String,
      default: null,
    },
    value: {
      type: String,
    },
    unit: {
      type: String,
    },
    color: { type: String, default: null },
    nonVeg: { type: Boolean, default: false },
    suggestedProduct: {
      type: [],
      default: [],
    },
    mrp: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      default: 0,
    },
    otherFlavour: [
      {
        value: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        label: { type: String },
      },
    ],
    otherColor: [
      {
        value: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        label: { type: String },
      },
    ],
    otherUnit: [
      {
        value: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        label: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model("Product", productSchema)

module.exports = Product
