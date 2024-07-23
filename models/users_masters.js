const db = require('./db')
const users_master = db.sequelize.define('users_masters',{
   
    
  
    users_master_name:{
        type:db.Sequelize.STRING
    },
    users_master_mail:{
        type:db.Sequelize.STRING
    },
    users_master_token:{
        type:db.Sequelize.STRING
    }
})






module.exports = users_master