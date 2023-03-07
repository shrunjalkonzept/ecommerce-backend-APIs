const asyncHandler = require("express-async-handler")
const Address = require("../models/AddressModal")

// @desc    add Address
// @route   POST /api/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const {
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    pinCode,
    city,
    state,
    country,
    phoneNo,
  } = req.body

  if (_id) {
    const newAddress = new Address({
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      pinCode,
      city,
      state,
      country,
      phoneNo,
      user: _id,
    })
    const response = await newAddress.save()
    res.status(201).json(response)
  } else {
    res.status(400)
    throw new Error(`user not found`)
  }
})

// @desc    get Address
// @route   GET /api/address
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const { _id } = req.user

  if (req.user) {
    const response = await Address.find({ user: _id })
    if (response && response.length) {
      res.status(200).json(response)
    } else {
      res.status(404)
      throw new Error("No address found")
    }
  } else {
    res.status(400)
    throw new Error(`user not found`)
  }
})

// @desc    get AddressById
// @route   GET /api/address/:id
// @access  Private

const getAddAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const address = await Address.findById(id)
  if (address) {
    res.status(200).json(address)
  } else {
    res.status(404)
    throw new Error("Address not found")
  }
})

// @desc    update updateAddress
// @route   PUT /api/address/:id
// @access  Private

const updateAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const newAddress = await Address.findOneAndUpdate({ id }, req.body, {
    new: true,
  })
  if (newAddress) {
    res.status(200).json(newAddress)
  } else {
    res.status(404)
    throw new Error("Address not found")
  }
})

// @desc    Delete Address
// @route   Delete /api/address/:id
// @access  Private
const deleteAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const newAddress = await Address.findOneAndDelete({ _id: id })
  if (newAddress) {
    res.status(200).json({ message: "address deleted successfully" })
  } else {
    res.status(404)
    throw new Error("Address not found")
  }
})

module.exports = {
  addAddress,
  getUserAddresses,
  getAddAddressById,
  updateAddressById,
  deleteAddressById,
}
