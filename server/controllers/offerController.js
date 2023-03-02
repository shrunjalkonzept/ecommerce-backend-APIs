const asyncHandler = require("express-async-handler")
const Offer = require("../models/offerModel")
const awsService = require("../utils/aws")

// @desc    Fetch all Offer
// @route   GET /api/offer
// @access  Private
const getOffer = asyncHandler(async (req, res) => {
  const response = await Offer.find({})
  if (response) {
    res.status(200).send(response)
  } else {
    res.status(404).send("Offer Not found")
  }
})

// @desc    Fetch offer byId
// @route   GET /api/offer/:id
// @access  Private
const getOfferById = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const response = await Offer.findById({ _id })
  if (response) {
    res.status(200).send(response)
  } else {
    res.status(404).send("Offer Not found")
  }
})

// @desc    Update offer
// @route   PUT /api/offer/:id
// @access  Private
const updateOffer = asyncHandler(async (req, res) => {
  const { discountType } = req.body
  const { _id } = req.params
  let image
  if (req.file && req.file.path) image = await awsService.uploadFile(req)
  if (image) req.body.image = image
  req.body.discountType = JSON.parse(discountType)

  const response = await Offer.findOneAndUpdate({ _id }, req.body, {
    new: true,
  })

  if (response) {
    res.status(200).send(response)
  } else {
    res.status(404).send("Offer Not found")
  }
})

// @desc    Delete offer
// @route   DELETE /api/offer/:id
// @access  Private
const deleteOffer = asyncHandler(async (req, res) => {
  const { _id } = req.params

  const response = await Offer.findByIdAndDelete({ _id })

  if (response) {
    res.status(200).send({ success: true })
  } else {
    res.status(404).send("Offer Not found")
  }
})
// @desc    Create Offer
// @route   POST /api/offer/:id
// @access  Private
const createOffer = asyncHandler(async (req, res) => {
  const { title, validTill, discountType, value, description } = req.body
  let image

  if (req.file && req.file.path) image = await awsService.uploadFile(req)

  if (image) {
    const newOffer = new Offer({
      title,
      image,
      validTill,
      discountType: JSON.parse(discountType),
      value,
      description,
    })
    const response = await newOffer.save()
    if (response) {
      res.status(201).send(response)
    } else {
      res.status(404).send("something went wrong")
    }
  } else {
    res.status(404).send("Image required")
  }
})

module.exports = {
  createOffer,
  deleteOffer,
  updateOffer,
  getOfferById,
  getOffer,
}
