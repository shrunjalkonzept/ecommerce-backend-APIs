const Joi = require("joi")
const schemas = {
  generateOTP: Joi.object({
    mobileNo: Joi.number(),
    resetPass: Joi.bool(),
  }),
  verifyOTP: Joi.object({
    mobileNo: Joi.number(),
    otp: Joi.number(),
    resetPass: Joi.bool(),
  }),
  auth: Joi.object({
    mobileNo: Joi.number(),
    password: Joi.alternatives(Joi.string(), Joi.number()),
  }),
  productId: Joi.object({
    id: Joi.string(),
  }),
  product: Joi.object({
    name: Joi.string(),
    price: Joi.number(),
    image: Joi.array(),
    brand: Joi.string(),
    category: Joi.string(),
    countInStock: Joi.number(),
    numReviews: Joi.number(),
    description: Joi.string(),
    sellerInformation: Joi.string(),
    mrp: Joi.number(),
    flavour: Joi.string(),
    value: Joi.string(),
    unit: Joi.string(),
    color: Joi.string(),
    nonVeg: Joi.boolean(),
    suggestedProduct: Joi.array(),
    otherUnit: Joi.array(),
    otherColor: Joi.array(),
    otherFlavour: Joi.array(),
  }),
  createProductReview: Joi.object({
    rating: Joi.number(),
    comment: Joi.string(),
  }),
}

module.exports = schemas
