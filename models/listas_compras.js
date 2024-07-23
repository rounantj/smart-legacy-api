



const db = require('./db')
const listas_compras = db.sequelize.define('listas_compras',{      
  
    lista_affiliate_id:{
        type:db.Sequelize.INTEGER
    },
    lista_client_id:{
        type:db.Sequelize.INTEGER
    },
    lista_name:{
        type:db.Sequelize.STRING
    },
    lista_conteudo:{
        type:db.Sequelize.STRING
    }
})






module.exports = listas_compras