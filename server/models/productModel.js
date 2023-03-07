const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

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
    reviews: [reviewSchema],
    numReviews: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
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
    suggestedProduct: [
      {
        value: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        label: { type: String },
      },
    ],
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
