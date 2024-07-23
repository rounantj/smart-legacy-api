module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      affiliateId: Number,
      masterId: Number,
      limitToShow: Number,
      categories: Array,
    },
    { timestamps: true }
  )

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id
    return object
  })

  const Categorie = mongoose.model('categories', schema)
  return Categorie
}
