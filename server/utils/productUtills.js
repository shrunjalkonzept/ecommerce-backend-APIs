const Product = require("../models/productModel")

function removeDuplicateAndOwnIds(objectIDs, idToRemove = false) {
  const ids = {}
  objectIDs.forEach((elem) => (ids[elem.value.toString()] = elem))
  if (idToRemove) delete ids[idToRemove.toString()]
  return Object.values(ids)
}

function containsObject(obj, list) {
  let i
  for (i = 0; i < list.length; i++) {
    if (list[i].value.toString() == obj.value.toString()) return true
  }
  return false
}

const synchronizeProductRelations = async (records = [], dataToSync, obj) => {
  try {
    const { value: ProductID } = obj
    let result = obj ? [...records, obj] : records
    const { [dataToSync]: serverData } = await Product.findById(
      ProductID
    ).select(dataToSync)
    const difference = serverData.filter((x) => !containsObject(x, records))

    if (difference.length) {
      // remove current product from other products
      await Promise.all(
        difference.map(async ({ value }) => {
          const { [dataToSync]: res } = await Product.findById(value).select(
            dataToSync
          )
          const updated = res.filter(
            (x) => x.value.toString() !== ProductID.toString()
          )
          await Product.findOneAndUpdate(
            { _id: value },
            {
              [dataToSync]: removeDuplicateAndOwnIds(updated, value),
            }
          )
        })
      )
    }
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
  } catch (error) {
    console.log(error)
  }
}

module.exports = { synchronizeProductRelations }
