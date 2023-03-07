const asyncHandler = require("express-async-handler")
const awsService = require("../utils/aws")
const Blog = require("../models/blogModel")

const createBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { title, description } = req.body
  if (req.file) {
    const result = await awsService.uploadFile(req)
    const blog = new Blog({
      title,
      description,
      user: _id,
      image: result,
    })
    const response = await blog.save()
    res.status(201).json(response)
  } else {
    res.status(400)
    throw new Error(`Image is required`)
  }
})

const getBlogs = asyncHandler(async (req, res) => {
  const response = await Blog.find({})
  if (response) {
    res.status(200).json(response)
  } else {
    res.status(404)
    throw new Error(`something went wrong`)
  }
})

const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params
  const { title, description, img } = req.body

  const blog = await Blog.findById(blogId)
  if (blog) {
    if (img && img.url === "") blog.image = { url: "", key: "" }
    if (req.file) {
      const result = await awsService.uploadFile(req)
      blog.image = result
    }
    blog.title = title
    blog.description = description
    const response = await blog.save()
    res.status(200).json(response)
  } else {
    res.status(404)
    throw new Error("blog not found")
  }
})

const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params
  const blog = await Blog.findById(blogId)
  if (blog) {
    res.status(200).json(blog)
  } else {
    res.status(404)
    throw new Error("blog not found")
  }
})

const deleteBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params
  const response = await Blog.findByIdAndDelete(blogId)
  if (response) {
    res.status(200).json({ message: "blog deleted successfully" })
  } else {
    res.status(404)
    throw new Error("blog not found")
  }
})

module.exports = {
  createBlog,
  getBlogs,
  updateBlog,
  getBlogById,
  deleteBlogById,
}
