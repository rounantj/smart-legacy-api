module.exports.categorie_find = async function (body, db, res, affiliateId) {
  try {
    const result = await db.Categorie.find({ affiliateId })
    let resultado = []
    if (result) {
      resultado = result
    }
    res.status(200).json({ data: resultado })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err })
  }
}
module.exports.categorie_find_many = async function (body, db, res) {
  try {
    const result = await db.Categorie.find()
    res.status(200).json({ data: result })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}
module.exports.categorie_create = async function (body, db, res) {
  try {
    const newCategorie = new db.Categorie(body)
    const saved = await newCategorie.save(newCategorie)
    res.status(200).json({ data: saved })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}
module.exports.categorie_update = async function (body, db, res, id) {
  try {
    console.log('affiliateID', id)
    const result = await db.Categorie.findOneAndUpdate(
      { affiliateId: id },
      body
    )
    res.status(200).json({ data: result })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}
module.exports.categorie_delete = async function (body, db, res, _id) {
  try {
    const result = await db.Categorie.deleteOne({ _id })
    res.status(200).json({ data: result })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}
