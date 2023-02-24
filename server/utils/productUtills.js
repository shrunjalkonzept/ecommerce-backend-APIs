const Product = require("../models/productModel")

function removeDuplicateAndOwnIds(objectIDs, idToRemove = false) {
  const ids = {}
  objectIDs.forEach((_id) => (ids[_id.toString()] = _id))
  if (idToRemove) delete ids[idToRemove.toString()]
  return Object.values(ids)
}

const synchronizeProductRelations = async (
  records = [],
  dataToSync,
  newProductId
) => {
  let result = [newProductId]
  await Promise.all(
    [...records, { value: newProductId }].map(async ({ value }) => {
      const { [dataToSync]: response } = await Product.findById(value).select(
        dataToSync
      )
      result = [...result, ...response]
    })
  )
  const uniqIds = removeDuplicateAndOwnIds(result)
  if (uniqIds.length)
    await Promise.all(
      uniqIds.map(async (_id) => {
        await Product.findOneAndUpdate(
          { _id },
          {
            [dataToSync]: removeDuplicateAndOwnIds(uniqIds, _id),
          }
        )
      })
    )
}

module.exports = { synchronizeProductRelations }
