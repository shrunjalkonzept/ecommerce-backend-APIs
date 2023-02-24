const asyncHandler = require("express-async-handler")
const Product = require("../models/productModel.js")
const { synchronizeProductRelations } = require("../utils/productUtills.js")
const awsService = require("../utils/aws")

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10
  const { pageNumber, filterBy, unit } = req.query
  const page = Number(pageNumber) || 1
  const weightUnits = ["kg", "gm"]
  let keyword = {}
  let count = null
  let products = []

  if (filterBy) keyword = { [filterBy]: { $nin: ["", null] } }
  if (unit)
    if (weightUnits.includes(unit)) keyword = { unit: { $in: weightUnits } }
    else keyword = { unit: { $in: ["pcs"] } }

  if (Object.keys(keyword).length) {
    count = await Product.countDocuments(keyword)
    products = await Product.find(keyword).select({ name: 1 })
    const productOption = products.map((elem) => {
      return { value: elem._id, label: elem.name }
    })
    res.status(200).json(productOption)
  }
  count = await Product.countDocuments()
  products = await Product.find()
  res
    .status(200)
    .json({ data: products, page, pages: Math.ceil(count / pageSize) })
})

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("otherFlavour.value", "flavour")
    .populate("otherUnit.value", "unit")
    .populate("otherColor.value", "color")

  if (product) {
    res.status(200).json(product)
  } else {
    res.status(404)
    throw new Error("Product not found")
  }
})

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    await product.remove()
    res.status(200).json({ message: "Product removed" })
  } else {
    res.status(404)
    throw new Error("Product not found")
  }
})

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { files } = req
  const { otherUnit, otherColor, otherFlavour, suggestedProduct } = req.body
  // changes below are temporary needs to fix  later
  console.log({ files })
  image = await Promise.all(
    files &&
      files.map(async (file) => {
        const { key, url } = await awsService.uploadFile({ file })
        return { key, url }
      })
  )
  req.body.otherUnit = JSON.parse(otherUnit)
  req.body.otherColor = JSON.parse(otherColor)
  req.body.otherFlavour = JSON.parse(otherFlavour)
  req.body.suggestedProduct = JSON.parse(suggestedProduct)
  req.body.image = image
  req.body.user = req.user._id

  const product = new Product(req.body)

  const { _id } = await product.save()
  if (req.body.otherUnit && req.body.otherUnit.length)
    await synchronizeProductRelations(req.body.otherUnit, "otherUnit", _id)
  if (req.body.otherColor && req.body.otherColor.length)
    await synchronizeProductRelations(req.body.otherColor, "otherColor", _id)
  if (req.body.otherFlavour && req.body.otherFlavour.length)
    await synchronizeProductRelations(
      req.body.otherFlavour,
      "otherFlavour",
      _id
    )

  const syncedProduct = await Product.findById({ _id })

  if (syncedProduct) res.status(201).json(syncedProduct)
  else {
    res.status(400)
    throw new Error("something went wrong")
  }
})

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { files } = req
  const { _id, otherUnit, otherColor, otherFlavour, suggestedProduct } =
    req.body

  // changes below are temporary needs to fix  later
  image = await Promise.all(
    files &&
      files.map(async (file) => {
        const { key, url } = await awsService.uploadFile({ file })
        return { key, url }
      })
  )
  req.body.otherUnit = JSON.parse(otherUnit)
  req.body.otherColor = JSON.parse(otherColor)
  req.body.otherFlavour = JSON.parse(otherFlavour)
  req.body.suggestedProduct = JSON.parse(suggestedProduct)
  if (image.length) req.body.image = image
  req.body.user = req.user._id
  const product = await Product.findOneAndUpdate({ _id }, req.body)

  if (product) {
    res.status(200).json(product)
  } else {
    res.status(404)
    throw new Error("Product not found")
  }
})

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      res.status(400)
      throw new Error("Product already reviewed")
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    }

    product.reviews.push(review)

    product.numReviews = product.reviews.length

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length

    await product.save()
    res.status(201).json({ message: "Review added" })
  } else {
    res.status(404)
    throw new Error("Product not found")
  }
})

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)
  res.status(200).json(products)
})

// @desc    Get relevant products
// @route   GET /api/products/relevant
// @access  public
const getRelevantProducts = asyncHandler(async (req, res) => {
  const { brand, category } = req.query
  const products = await Product.find({
    $or: [{ brand }, { category }],
  })

  res.status(200).json(products)
})
module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getRelevantProducts,
}