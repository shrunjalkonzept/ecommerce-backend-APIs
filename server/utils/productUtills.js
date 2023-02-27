const Product = require("../models/productModel")

function removeDuplicateAndOwnIds(objectIDs, idToRemove = false) {
  const ids = {}
  objectIDs.forEach((elem) => (ids[elem.value.toString()] = elem))
  if (idToRemove) delete ids[idToRemove.toString()]
  return Object.values(ids)
}

const synchronizeProductRelations = async (
  records = [],
  dataToSync,
  newProductId
) => {
  let result = newProductId ? [...records, newProductId] : records
  await Promise.all(
    [...records].map(async ({ value }) => {
      const { [dataToSync]: response } = await Product.findById(value).select(
        dataToSync
      )
      result = [...result, ...response]
    })
  )
  const uniqIds = removeDuplicateAndOwnIds(result)
  if (uniqIds.length)
    await Promise.all(
      uniqIds.map(async ({ value }) => {
        await Product.findOneAndUpdate(
          { _id: value },
          {
            [dataToSync]: removeDuplicateAndOwnIds(uniqIds, value),
          }
        )
      })
    )
}

module.exports = { synchronizeProductRelations }
