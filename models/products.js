const db = require('./db')
const products = db.sequelize.define('products',{ 
  
    product_affiliate_id:{
        type:db.Sequelize.INTEGER
    },
    product_descricao:{
        type:db.Sequelize.STRING
    },
    product_valor:{
        type:db.Sequelize.FLOAT
    },
    product_categoria:{
        type:db.Sequelize.STRING
    },
    product_fabricacao:{
        type:db.Sequelize.STRING
    },
    product_estoque:{
        type:db.Sequelize.INTEGER
    },
    product_medida:{
        type:db.Sequelize.STRING
    },
    product_etiquetas:{
        type:db.Sequelize.STRING
    }
})

module.exports = products