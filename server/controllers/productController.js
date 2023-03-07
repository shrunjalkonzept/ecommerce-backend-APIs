const asyncHandler = require("express-async-handler")
const Product = require("../models/productModel.js")
const { synchronizeProductRelations } = require("../utils/productUtills.js")
const awsService = require("../utils/aws")
const { map } = require("lodash")
const BrandAndCategory = require("../models/brandAndCategoryModel.js")

const blankImgArray = [
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
  {
    url: "",
    key: "",
  },
]

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10
  const { pageNumber, filterBy, unit, brand, sortBy, rating } = req.query
  const page = Number(pageNumber) || 1
  const weightUnits = ["kg", "gm"]
  let keyword = [{ $match: { name: { $exists: true } } }]
  let count = null
  let products = []

  // filter based on brand
  if (brand) {
    if (Array.isArray(brand))
      keyword.push({ $match: { brand: { $in: brand } } })
    else keyword.push({ $match: { brand: { $in: [brand] } } })
  }
  // filter based on user rating
  if (rating) {
    if (Array.isArray(rating))
      keyword.push({ $match: { rating: { $in: rating.map(Number) } } })
    else keyword.push({ $match: { rating: { $eq: Number(rating) } } })
  }

  // sort by rating and cost
  if (sortBy) {
    switch (sortBy) {
      case "ratingHighToLow":
        keyword.push({ $sort: { rating: -1 } })
        break
      case "ratingLowToHigh":
        keyword.push({ $sort: { rating: 1 } })
        break
      case "costHighToLow":
        keyword.push({ $sort: { price: -1 } })
        break
      case "costHighLowToHigh":
        keyword.push({ $sort: { price: 1 } })
        break
      default:
        break
    }
  }
  //recommendation  logic for creating product
  if (unit || filterBy) {
    let obj = {}
    if (filterBy) obj = { [filterBy]: { $nin: ["", null] } }
    if (unit) {
      if (weightUnits.includes(unit)) obj = { unit: { $in: weightUnits } }
      else obj = { unit: { $in: ["pcs"] } }
    }
    const products = await Product.find(obj).select({ name: 1 })
    const productOption = products.map((elem) => {
      return { value: elem._id, label: elem.name }
    })
    res.status(200).json(productOption)
  }
  // keyword.push({
  //   $project: { name: 1, brand: 1, unit: 1, price: 1, rating: 1 },
  // })
  count = await Product.countDocuments()
  products = await Product.aggregate(keyword)
  res
    .status(200)
    .json({ data: products, page, pages: Math.ceil(count / pageSize) })
})

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("otherFlavour.value", ["flavour", "image", "name", "createdAt"])
    .populate("otherUnit.value", ["unit", "image", "name", "createdAt"])
    .populate("otherColor.value", ["color", "image", "name", "createdAt"])
    .populate("suggestedProduct.value", ["image", "name", "createdAt"])

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
  image = await Promise.all(
    files &&
      files.map(async (file) => {
        const { key, url } = await awsService.uploadFile({ file })
        return { key, url }
      })
  )
  const finalImgArr = [...image, ...blankImgArray]
  finalImgArr.splice(10, image.length)
  req.body.otherUnit = JSON.parse(otherUnit)
  req.body.otherColor = JSON.parse(otherColor)
  req.body.otherFlavour = JSON.parse(otherFlavour)
  req.body.suggestedProduct = JSON.parse(suggestedProduct)
  req.body.image = finalImgArr
  req.body.user = req.user._id

  const product = new Product(req.body)

  const { _id, name } = await product.save()
  const obj = {
    value: _id,
    label: name,
  }
  if (req.body.otherUnit && req.body.otherUnit.length)
    await synchronizeProductRelations(req.body.otherUnit, "otherUnit", obj)
  if (req.body.otherColor && req.body.otherColor.length)
    await synchronizeProductRelations(req.body.otherColor, "otherColor", obj)
  if (req.body.otherFlavour && req.body.otherFlavour.length)
    await synchronizeProductRelations(
      req.body.otherFlavour,
      "otherFlavour",
      obj
    )
  if (req.body.suggestedProduct && req.body.suggestedProduct.length)
    await synchronizeProductRelations(
      req.body.suggestedProduct,
      "suggestedProduct",
      obj
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
  const { files, image } = req
  const {
    _id,
    otherUnit,
    otherColor,
    otherFlavour,
    suggestedProduct,
    updatedImageIds,
    name,
  } = req.body

  // changes below are temporary needs to fix  later
  const product = await Product.findById({ _id })
  const newImages = await Promise.all(
    files &&
      files.map(async (file) => {
        const { key, url } = await awsService.uploadFile({ file })
        return { key, url }
      })
  )
  // preserve image order
  const imageUpdateOrder = JSON.parse(updatedImageIds) ?? []
  if (imageUpdateOrder && updatedImageIds.length)
    imageUpdateOrder.map(({ index, removed }) =>
      removed
        ? product.image.splice(index, 1, blankImgArray.shift())
        : product.image.splice(index, 1, newImages.shift())
    )
  req.body.otherUnit = JSON.parse(otherUnit)
  req.body.otherColor = JSON.parse(otherColor)
  req.body.otherFlavour = JSON.parse(otherFlavour)
  req.body.suggestedProduct = JSON.parse(suggestedProduct)
  if (product.image.length) req.body.image = product.image
  req.body.user = req.user._id

  const obj = {
    value: _id,
    label: name,
  }

  await synchronizeProductRelations(req.body.otherUnit ?? [], "otherUnit", obj)

  await synchronizeProductRelations(
    req.body.otherColor ?? [],
    "otherColor",
    obj
  )

  await synchronizeProductRelations(
    req.body.otherFlavour ?? [],
    "otherFlavour",
    obj
  )

  await synchronizeProductRelations(
    req.body.suggestedProduct ?? [],
    "suggestedProduct",
    obj
  )

  const updatedProduct = await Product.findOneAndUpdate({ _id }, req.body)

  if (updatedProduct) {
    res.status(200).json(updatedProduct)
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

const getHomeScreenData = asyncHandler(async (req, res) => {
  const brands = await BrandAndCategory.find({ type: "brand" }).select([
    "image",
    "name",
    "type",
  ])
  const category = await BrandAndCategory.find({ type: "category" }).select([
    "image",
    "name",
    "type",
  ])
  const newArrivals = await Product.find({})
    .sort({ createdAt: -1 })
    .select(["name", "price", "mrp", "rating", "image", "description"])
  const trendingProducts = await Product.find({ isTrending: true }).select([
    "name",
    "price",
    "mrp",
    "rating",
    "image",
    "description",
  ])
  res.status(200).json({ brands, category, newArrivals, trendingProducts })
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
  getHomeScreenData,
}
