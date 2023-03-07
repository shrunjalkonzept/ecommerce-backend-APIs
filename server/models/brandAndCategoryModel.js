const mongoose = require("mongoose")

const brandAndCategorySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {},
    type: {
      type: String,
      enum: ["category", "brand"],
      default: "brand",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const BrandAndCategory = mongoose.model(
  "BrandAndCategory",
  brandAndCategorySchema
)

module.exports = BrandAndCategory
