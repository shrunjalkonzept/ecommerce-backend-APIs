const { string } = require("joi")
const mongoose = require("mongoose")

const offerSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      key: { type: String, required: true },
    },
    validTill: { type: String, required: true },
    discountType: {
      label: { type: String, required: true },
      value: { type: String, required: true },
    },
    value: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const Offer = mongoose.model("Offer", offerSchema)
module.exports = Offer
