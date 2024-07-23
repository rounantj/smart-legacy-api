const db = require('./db')
const affiliates = db.sequelize.define('affiliates',{       
    
    affiliates_master_id:{
        type:db.Sequelize.INTEGER
    },
    affiliates_business_name:{
        type:db.Sequelize.STRING
    },
    affiliates_business_telefone:{
        type:db.Sequelize.STRING
    },
    affiliates_business_mail:{
        type:db.Sequelize.STRING
    },
    affiliates_business_horario:{
        type:db.Sequelize.STRING
    },
    affiliates_business_endereco:{
        type:db.Sequelize.STRING
    },
    affiliates_business_numero:{
        type:db.Sequelize.STRING
    },
    affiliates_business_cep:{
        type:db.Sequelize.STRING
    },
    affiliates_business_cidade:{
        type:db.Sequelize.STRING
    },
    affiliates_business_estado:{
        type:db.Sequelize.STRING
    }
})

module.exports = affiliates