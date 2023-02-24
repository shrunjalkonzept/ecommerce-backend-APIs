const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property])
    const valid = error == null
    if (valid) {
      next()
    } else {
      const { details } = error
      const message = details.map((i) => i.message).join(",")

      console.error(message)
      res.send(message, details, 400)
    }
  }
}
module.exports = validateRequest
