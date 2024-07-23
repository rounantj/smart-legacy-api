const db = require('./db')
const users_affiliates = db.sequelize.define('users_affiliates',{
  
    users_affiliate_master_id:{
        type:db.Sequelize.INTEGER
    },
    users_affiliate_name:{
        type:db.Sequelize.STRING
    },
    users_affiliate_perfil:{
        type:db.Sequelize.STRING
    },
    users_affiliate_mail:{
        type:db.Sequelize.STRING
    },
    users_affiliate_token:{
        type:db.Sequelize.STRING
    }
})

module.exports = users_affiliates