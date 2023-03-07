const mongoose = require("mongoose")

const blogSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    image: {},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Blog = mongoose.model("Blog", blogSchema)

module.exports = Blog
