const db = require('./db')
const orders = db.sequelize.define('orders',{ 
  
    order_affiliate_id:{
        type:db.Sequelize.INTEGER
    },
    order_client_id:{
        type:db.Sequelize.INTEGER
    },
    order_status:{
        type:db.Sequelize.STRING
    },
    order_data_entrega:{
        type:db.Sequelize.DATE
    },
    order_metodo_pagamento:{
        type:db.Sequelize.STRING
    },
    order_cpf_nf:{
        type:db.Sequelize.STRING
    },
    order_tamanho_cesta:{
        type:db.Sequelize.STRING
    },
    order_conteudo:{
        type:db.Sequelize.STRING
    },
    order_valor_total:{
        type:db.Sequelize.FLOAT
    }
})

module.exports = orders