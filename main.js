/*======================= SMARTCOMMERCI MAIN =========================== 

Author: Ronan Rodrigues
Contact: Tel.: 27 996011204, Mail: ronan.rodrigues@pullup.tech
Objective: Script principal que orquestra os controladores, as rotas e os modelos de  dados

=========================================================================*/

// Importando as variaveis de ambiente
require('dotenv').config()

var _DIRETORIO_ = process.env._DIR_

// Chamando dependências e configurando o app
var express = require('express')
var consign = require('consign')
var app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(_DIRETORIO_ + 'public'))
const cors = require('cors')
app.use(express.json())
var fs = require('fs')
const fs_Promises = require('fs').promises
const jwt = require('jsonwebtoken')
const https = require('https')
// Configurando a engine de views para a documentação web
app.set('views', _DIRETORIO_ + 'views')
app.set('view engine', 'ejs')

// Ajuste de CROSS DOMAIN para reutilização da API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  app.use(cors())
  next()
})

// Função principal para JWT ( Jason Web Token ), validando todas as conexões com os end-points
function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token']
  if (!token)
    return res.status(401).json({ auth: false, message: 'No token provided.' })

  jwt.verify(token, process.env.MAIN_SECRET, function (err, decoded) {
    console.log(decoded)
    if (err)
      return res
        .status(500)
        .json({ auth: false, message: 'Failed to authenticate token.' })
    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id
    next()
  })
}

const integrator = require('./integrator')

integrator.start(app, _DIRETORIO_, verifyJWT, express)

app.listen(process.env.PORT || 9090, function () {
  console.log('Port ' + process.env.PORT || 9090)
})
