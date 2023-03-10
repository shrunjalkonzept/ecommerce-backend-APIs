const express = require("express")
const router = express.Router()
// config routers
require("./userRoutes")(router)
require("./productRoutes")(router)
require("./offerRoutes")(router)
require("./blogRoutes")(router)
require("./addressRoute")(router)
// keep last
require("./brandAndCategoryRoutes")(router)

module.exports = function (app) {
  app.get("/", (req, res) => res.send("API is running...."))
  app.use("/api/v1", router)
}
