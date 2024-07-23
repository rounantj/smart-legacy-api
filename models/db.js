/*=========== Database Settings Default for Sequelize ===========

Author: Ronan Rodrigues
Contact: Tel.: 27 996011204, Mail: ronan.rodrigues@pullup.tech
Objective: Definir as configurações do módulo Sequelize testar a conexão
           e exportar o serviço.

=================================================================*/



// Importando dependencias
const Sequelize = require('sequelize');
const Op = Sequelize.Op




// Setando credenciais
const sequelize = new Sequelize(
    process.env.database,
    process.env.user,
    process.env.password, {
    host:process.env.host,
    dialect:'mysql'
})

// Testando conexão
sequelize.authenticate().then( function(){
console.log("Connection ok!")
}).catch(function(erro){
    console.log("Throw error db: "+ erro)
})


module.exports = {    
    Sequelize:Sequelize,
    Op: Op,
    sequelize: sequelize
}