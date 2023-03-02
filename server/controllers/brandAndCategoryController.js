const asyncHandler = require("express-async-handler")
const BrandAndCategory = require("../models/brandAndCategoryModel")
const awsService = require("../utils/aws")

// @desc    Fetch all products
// @route   GET /api/:type
// @access  Private
const getBrandsAndCategory = asyncHandler(async (req, res) => {
  const pageSize = 10
  const page = Number(req.query.pageNumber) || 1
  const { type } = req.params

  const count = await BrandAndCategory.countDocuments({})

  const data = await BrandAndCategory.find({ type })
  // complete when pagination is done inn frontend side
  // const data = await BrandAndCategory.find({ type })
  //   .limit(pageSize)
  //   .skip(pageSize * (page - 1))
  res.status(200).json({ data, page, pages: Math.ceil(count / pageSize) })
})

// @desc    Fetch all products
// @route   POST /api/:type
// @access  Private

const createBrandsAndCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  const { type } = req.params
  const result = await BrandAndCategory.findOne({ name })
  if (result) {
    res.status(400)
    throw new Error(`${type} already exist`)
  } else {
    if (req.file) {
      const result = await awsService.uploadFile(req)
      const brandAndCategory = new BrandAndCategory({
        name,
        type,
        image: result.url,
      })
      const createdBrandAndCategory = await brandAndCategory.save()
      res.status(201).json(createdBrandAndCategory)
    } else {
      res.status(400)
      throw new Error(`Image is required`)
    }
    // const presigned = await awsService.getPreSignedURL(result.Key)
  }
})

// @desc    Fetch all products
// @route   PUT /api/:type/:id
// @access  Private
const updateBrandsAndCategory = asyncHandler(async (req, res) => {
  const { type } = req.params
  const { name, _id } = req.body

  const result = await BrandAndCategory.findById({ _id })
  if (result) {
    if (req.file && req.file.path) {
      const img = await awsService.uploadFile(req)
      result.image = img.url
    }
    result.name = name
    await result.save()
    res.status(200).json(result)
  } else {
    res.status(404)
    throw new Error(`No ${type} found`)
  }
})

// @desc    Fetch all products
// @route   delete /api/:type/:id
// @access  Private
const deleteBrandsAndCategory = asyncHandler(async (req, res) => {
  const { type } = req.params
  const { _id } = req.body

  const result = await BrandAndCategory.findOne({ _id })
  if (result) {
    await result.remove()
    res.status(200).json({ success: true, message: `${type} removed` })
  } else {
    res.status(404)
    throw new Error(`No ${type} found`)
  }
})

module.exports = {
  getBrandsAndCategory,
  updateBrandsAndCategory,
  deleteBrandsAndCategory,
  createBrandsAndCategory,
}
