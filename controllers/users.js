/*======================= SMARTCOMMERCI USERS =========================== 

Author: Ronan Rodrigues
Contact: Tel.: 27 996011204, Mail: ronan.rodrigues@pullup.tech
Objective: Consultar e alterar os dados de usuários conforme as regras do negócio

=========================================================================*/

// Importando modelos e dependências
var users_masters = require('../models/users_masters')
var users_affiliates = require('../models/users_affiliates')
var users_clients = require('../models/users_clients')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')

// Configurando uma conexão com o database
const conn = mysql.createConnection({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})

//==========================================================================================================

// Update de detalhes de usuario
module.exports.updateUserDetail = function (body, res) {
  if (
    body.fieldName != undefined &&
    body.newValue != undefined &&
    body.affiliate_id != undefined &&
    body.clientId != undefined
  ) {
    execSQL(
      'update users_clients set ' +
      body.fieldName +
      " = '" +
      body.newValue +
      "' where users_client_affiliate_id = " +
      body.affiliate_id +
      ' and id = ' +
      body.clientId,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Update de detalhes de usuario
module.exports.updateUserFromCMS = function (body, res) {
  if (
    body.table != undefined &&
    body.column != undefined &&
    body.newValue != undefined &&
    body.idValue != undefined &&
    body.columnId != undefined
  ) {
    let newValue = "'" + body.newValue + "'"
    if (body.column.indexOf('token') > -1) {
      newValue = 'sha1(' + newValue + ')'
    }
    console.log(
      'feedback update ' +
      body.table +
      ' set ' +
      body.column +
      ' = ' +
      newValue +
      ' where ' +
      body.columnId +
      ' = "' +
      body.idValue +
      '"'
    )

    execSQL(
      'update ' +
      body.table +
      ' set ' +
      body.column +
      ' = ' +
      newValue +
      ' where ' +
      body.columnId +
      ' = "' +
      body.idValue +
      '"',
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Update de detalhes de usuario
module.exports.clientAddress = function (body, res) {
  if (body.client_id != undefined) {
    execSQL('select * from users_clients where  id = ' + body.client_id, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Update de detalhes de usuario
module.exports.autenticateAdmin = function (body, res) {
  if (
    body.master_id != undefined &&
    body.pass != undefined &&
    body.mail != undefined
  ) {
    execSQL(
      "select * from users_masters where users_master_token = sha1('" +
      body.pass +
      "') and users_master_name = '" +
      body.mail +
      "' and master_id = " +
      body.master_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Update de detalhes de usuario
module.exports.autenticateUser = function (body, res) {
  if (
    body.users_affiliate_master_id != undefined &&
    body.pass != undefined &&
    body.mail != undefined
  ) {
    execSQL(
      "select * from users_affiliates where users_affiliate_token = sha1('" +
      body.pass +
      "') and users_affiliate_name = '" +
      body.mail +
      "' and users_affiliate_master_id = " +
      body.master_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Update de detalhes de usuario
module.exports.autenticateClient = function (body, res) {
  if (
    body.users_client_affiliate_id != undefined &&
    body.pass != undefined &&
    body.mail != undefined
  ) {
    execSQL(
      "select * from users_clients where users_client_token = sha1('" +
      body.pass +
      "') and users_client_mail = '" +
      body.mail +
      "' and users_client_affiliate_id = " +
      body.master_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.consultaCadastro = function (body, res) {
  if (body.mail) {
    execSQL(
      "select * from users_affiliates where users_affiliate_name = '" +
      body.mail +
      "'",
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}
async function sendMailSendgrid(message) {
  console.log(message)
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(
    process.env.SENDGRID_KEY
  )

  const msg = {
    to: message.to, // Change to your recipient
    from: 'naoresponda@smartcomerci.com.br', //,message.from, // Change to your verified sender
    subject: message.subject,
    text: message.text ? message.text : 'empty',
    html: message.html,
  }

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
      console.log(response[0].headers)

      return response
    })
    .catch((error) => {
      console.error(error)
      return JSON.stringify(error)
    })
}

module.exports.salvaEmailPublicidade = function (body, res) {
  if (body.mail) {
    let SQL = `insert into mailsToMarketing values (null, '${body.mail}',${body.affiliate_id}, now(), now())`

    sendMailSendgrid({
      to: body.mail,
      from: 'naoresponda@smartcomerci.com.br', //,message.from, // Change to your verified sender
      subject: 'Cadastro em newsletter!',
      text: 'empty',
      html: 'Olá,<br><br>Obrigado por se inscrever, em breve enviaremos nossas ofertas por e-mail!',
    })
    execSQL(SQL, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

module.exports.consultaCadastroCliente = function (body, res) {
  if (body.mail) {
    execSQL(
      "select * from users_clients where users_client_mail = '" +
      body.mail +
      "'",
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

module.exports.informacoesDeClientes = function (body, res) {
  if (body.affiliate_id) {
    execSQL(
      'select id, updatedAt, createdAt, users_client_affiliate_id from users_clients where users_client_affiliate_id = ' +
      body.affiliate_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

// Função requerer o token de usuario
module.exports.clientAuthReverso = function (body, res) {
  console.log('lavai o body', body)
  if (body.token_me != undefined) {
    var sql =
      "select *, sha1(concat(id,users_client_mail)) as token_me from users_clients where  sha1(concat(id,users_client_mail)) = '" +
      body.token_me +
      "'"
    console.log(sql)
    conn.query(sql, function (error, results, fields) {
      if (results.length > 0) {
        //auth ok
        const id = results[0].id //esse id vem do banco de dados
        const token = jwt.sign({ id }, process.env.MAIN_SECRET, {
          expiresIn: 43200, // minutes to expire
        })
        res.send({
          auth: true,
          id: results[0].id,
          users_client_affiliate_id: results[0].users_client_affiliate_id,
          users_client_name: results[0].users_client_name,
          users_client_todos_enderecos: results[0].users_client_todos_enderecos,
          users_client_mail: results[0].users_client_mail,
          users_client_telefone: results[0].users_client_telefone,
          users_client_cpf: results[0].users_client_cpf,
          users_client_endereco: results[0].users_client_endereco,
          users_client_cep: results[0].users_client_cep,
          users_client_bairro: results[0].users_client_bairro,
          users_client_token: results[0].users_client_token,
          users_client_cidade: results[0].users_client_cidade,
          users_client_numero: results[0].users_client_numero,
          users_client_complemento: results[0].users_client_complemento,
          users_client_listas_compras: results[0].users_client_listas_compras,
          token: token,
          token_me: results[0].token_me,
        })
      } else {
        res.status(500).json({ message: 'Login inválido!' })
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}
module.exports.clientAuth = function (body, res) {
  console.log('lavai o body', body)
  if (body.mail != undefined && body.password != undefined) {
    var sql =
      "select *, sha1(concat(id,users_client_mail)) as token_me from users_clients where users_client_mail =  '" +
      body.mail +
      "'  and users_client_token = sha1('" +
      body.password +
      "')"
    console.log(sql)
    conn.query(sql, function (error, results, fields) {
      if (results.length > 0) {
        //auth ok
        const id = results[0].id //esse id vem do banco de dados
        const token = jwt.sign({ id }, process.env.MAIN_SECRET, {
          expiresIn: 43200, // minutes to expire
        })
        res.send({
          auth: true,
          id: results[0].id,
          users_client_affiliate_id: results[0].users_client_affiliate_id,
          users_client_name: results[0].users_client_name,
          users_client_todos_enderecos: results[0].users_client_todos_enderecos,
          users_client_mail: results[0].users_client_mail,
          users_client_telefone: results[0].users_client_telefone,
          users_client_cpf: results[0].users_client_cpf,
          users_client_endereco: results[0].users_client_endereco,
          users_client_cep: results[0].users_client_cep,
          users_client_bairro: results[0].users_client_bairro,
          users_client_token: results[0].users_client_token,
          users_client_cidade: results[0].users_client_cidade,
          users_client_numero: results[0].users_client_numero,
          users_client_complemento: results[0].users_client_complemento,
          users_client_listas_compras: results[0].users_client_listas_compras,
          token: token,
          token_me: results[0].token_me,
        })
      } else {
        res.status(500).json({ message: 'Login inválido!' })
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Função requerer o token de usuario

module.exports.clientConfere = function (body, res) {
  console.log(body)
  if (body.mail != undefined) {
    var sql =
      "select *, sha1(concat(id,users_client_mail)),users_client_complemento,users_client_numero  as token_me from users_clients where users_client_mail =  '" +
      body.mail +
      "'"
    console.log(sql)
    conn.query(sql, function (error, results, fields) {
      if (results.length > 0) {
        //auth ok
        const id = results[0].id //esse id vem do banco de dados
        const token = jwt.sign({ id }, process.env.MAIN_SECRET, {
          expiresIn: 43200, // minutes to expire
        })
        res.send({
          auth: true,
          id: results[0].id,
          users_client_affiliate_id: results[0].users_client_affiliate_id,
          users_client_name: results[0].users_client_name,
          users_client_mail: results[0].users_client_mail,
          users_client_telefone: results[0].users_client_telefone,
          users_client_cpf: results[0].users_client_cpf,
          users_client_endereco: results[0].users_client_endereco,
          users_client_cep: results[0].users_client_cep,
          users_client_bairro: results[0].users_client_bairro,
          users_client_cidade: results[0].users_client_cidade,
          users_client_numero: results[0].users_client_numero,
          users_client_complemento: results[0].users_client_complemento,
          users_client_listas_compras: results[0].users_client_listas_compras,
          token: token,
          token_me: results[0].token_me,
        })
      } else {
        res.status(500).json({ message: 'Login inválido!' })
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

//==========================================================================================================

// Função para executar um comando SQL
// Parametros: query= 'QUERY SQL VÁLIDA'; res = 'RESPONSE'
async function execSQL(query, res) {
  console.log(query)
  conn.query(query, async function (error, results, fields) {
    if (!error) {
      res.send(results)
    } else {
      res.send(error)
    }
  })
}

//==========================================================================================================

// Exporta todos Usuários Master
// Parametros:
module.exports.users_masters = function (err, res) {
  users_masters.findAll().then((data) => {
    if (!err) {
      res.send(data)
    }
  })
}

// Exporta todos Usuários Master
// Parametros:
module.exports.updateAffiliateUsers = function (body, res) {
  console.log(body)
  if (body.myToken != undefined && body.userName != undefined) {
    let status1 = 1
    if (body.active == 'false') {
      status1 = 0
    }
    conn.query(
      'select * from users_affiliates where users_affiliate_id = ' +
      body.affiliate_id +
      ' and users_affiliate_name = "' +
      body.userName +
      '" and users_affiliate_token = "' +
      body.myToken +
      '" ',
      async function (error, results, fields) {
        if (!error) {
          if (results.length > 0) {
            execSQL(
              'update users_affiliates set status = ' +
              status1 +
              ' where users_affiliate_id = ' +
              body.affiliate_id +
              ' and users_affiliate_name = "' +
              body.userName +
              '" and users_affiliate_token = "' +
              body.myToken +
              '" ',
              res
            )
          } else {
            execSQL(
              'insert into users_affiliates values (null, null, ' +
              status1 +
              ' ,' +
              body.master_id +
              ', ' +
              body.affiliate_id +
              ', "' +
              body.userName +
              '","SEM FUNÇÃO", "' +
              body.userName +
              '", "' +
              body.myToken +
              '", now(), now())',
              res
            )
          }
        } else {
          res.send({ message: 'Invalid fields!', fields: body, errou: error })
        }
      }
    )
  } else {
    res.send({ message: 'Invalid fields!', fields: body })
  }
}

// Exporta todos Usuários Master
// Parametros:
module.exports.updateAffiliateUsersDetails = function (body, res) {
  if (body.myToken != undefined && body.userName != undefined) {
    if (body.fieldName.indexOf('token') > -1) {
      body.newValue = ' sha1("' + body.newValue.trim() + '") '
    } else {
      body.newValue = '"' + body.newValue.trim() + '"'
    }
    execSQL(
      'update ' +
      body.table +
      ' set ' +
      body.fieldName +
      ' = ' +
      body.newValue +
      ' where users_affiliate_name = "' +
      body.userName +
      '" and users_affiliate_token = "' +
      body.myToken +
      '"',
      res
    )
  } else {
    res.send({ message: 'Invalid fields!', fields: body })
  }
}

// Exporta todos Usuários Master
// Parametros:
async function informandoPeloEmail(titulo, email) {
  let SQL = `select *  from users_clients inner join affiliates inner join emails_marketing where users_client_mail = '${email}' and users_client_affiliate_id = affiliates.id and affiliates.affiliates_master_id = emails_marketing.master_id and emails_marketing.tipo_email = '${titulo}'  limit 1`
  console.log(SQL)
  conn.query(SQL, async function (error, results, fields) {
    if (!error) {
      const resultOk = JSON.parse(JSON.stringify(results))
      console.log(resultOk)
      sendMailSendgrid({
        to: email,
        from: 'naoresponda@smartcomerci.com.br', //,message.from, // Change to your verified sender
        subject: resultOk[0].titulo ? resultOk[0].titulo : 'Email sem título!',
        text: 'empty',
        html: resultOk[0].conteudo ? resultOk[0].conteudo : 'Email vazio!',
      })
    }
  })
}
module.exports.updateClientDetailsFront = async function (body, res) {
  if (body.myToken != undefined && body.userMail != undefined) {
    let isPassChange = false
    if (body.fieldName.indexOf('token') > -1) {
      isPassChange = true
      body.newValue = `sha1('${body.newValue.trim()}')`
    } else {
      body.newValue = `'${body.newValue.trim()}'`
    }

    let SQL = ''
    if (
      (body.myToken === 'null' && body.fieldName.indexOf('token') > -1) ||
      (!body.myToken && body.fieldName.indexOf('token') > -1)
    ) {
      isPassChange = true
      SQL = `update ${body.table} set ${body.fieldName} = ${body.newValue} where  users_client_mail = '${body.userMail}'`
    } else {
      SQL = `update ${body.table} set ${body.fieldName} = ${body.newValue} where  users_client_mail = '${body.userMail}'`
    }
    if (isPassChange) {
      await informandoPeloEmail('Alteração de senha', body.userMail)
    }

    execSQL(SQL, res)
  } else {
    console.log({ message: 'Invalid fields!', fields: body })
    res.send({ message: 'Invalid fields!', fields: body })
  }
}

//==========================================================================================================

// Exporta todos Usuários Affiliates
// Parametros:
module.exports.users_affiliates = function (err, res) {
  users_affiliates.findAll().then((data) => {
    if (!err) {
      res.send(data)
    }
  })
}

//==========================================================================================================

// Exporta todos Usuários Clients
// Parametros:
module.exports.users_clients = function (err, res) {
  users_clients.findAll().then((data) => {
    if (!err) {
      res.send(data)
    }
  })
}

//==========================================================================================================

// Insere novo usuário contanto que não exista outro com mesmo e-mail
/* Parametros: 
        body= {
            'table'; 'users_clients' ou 'users_masters' ou 'users_affiliates', 
            'prefix': 'NOME DA TABELA SEM O 's' NO FIM. EX.: 'users_master', 
            'mail': 'E-MAIL DO NOVO USUÁRIO',
            'fields': 'ARRAY COM TODOS OS CAMPOS DA TABELA E SEUS RESPECTIVOS VALORES, EX.: 
                        [
                                {"fieldName":"users_client_affiliate_id" , "value": 1},  ==> Valor informado pelo ambiente da loja em questão ao ser acessada!
                                {"fieldName":"users_client_name" , "value": "Ronan Rodrigues"},
                                {"fieldName":"users_client_mail" , "value": "meuEmail@meuemail.com"},
                                {"fieldName":"users_client_token" , "value": "minhasenhaValida"},
                                {"fieldName":"users_client_cpf" , "value": 123456789102},
                                {"fieldName":"users_client_endereco" , "value": "Rua XXXX Nº XXXX"},
                                {"fieldName":"users_client_cep" , "value": "29000000"},
                                {"fieldName":"users_client_bairro" , "value": "Jacupemba"},
                                {"fieldName":"users_client_listas_compras" , "value": "Principal"},
                                {"fieldName":"users_client_cidade" , "value": "Aracruz"}
                        ]
            }
    Respostas:
            'Success' com os valores fieldCount, affectedRows, insertId, serverStatus e warningCount
            'Error' status 500, 'Internal Server Error' com 'responseJSON' => responseJSON: {message: "User mail already exists!"} ou Details: {'ExpectedFields: [Array], YourFields: [Array]}

*/
module.exports.insertNew = function (body, res) {
  console.log(body)

  conn.query(
    'select * from ' +
    body.table +
    ' where ' +
    body.prefix +
    "_mail = '" +
    body.mail +
    "'",
    async function (error, results, fields) {
      if (!error) {
        console.log(results)
        if (results.length > 0) {
          res.status(409).json({ message: 'User mail already exists!' })
        } else {
          if (body.table.indexOf('user') > -1) {
            conn.query(
              'desc ' + body.table,
              async function (error, results, fields) {
                if (!error) {
                  var columns = [],
                    byUser = '',
                    byDB = ' ('

                  for (const k in results) {
                    byDB += results[k].Field + ', '
                    if (
                      results[k].Field != 'id' &&
                      results[k].Field != 'updatedAt' &&
                      results[k].Field != 'createdAt'
                    ) {
                      columns.push({
                        fieldName: results[k].Field,
                        fieldType: results[k].Type,
                      })
                    }
                  }
                  byDB += ') '
                  byDB = byDB.replace(', )', ')')
                  var fields = body.fields,
                    anomaly = []
                  for (const k in fields) {
                    for (const c in columns) {
                      if (fields[k].fieldName === columns[c].fieldName) {
                        if (columns[c].fieldType == 'int(11)') {
                          byUser += Number(fields[k].value) + ', '
                          if (!Number(fields[k].value)) {
                            anomaly.push({
                              yourField: fields[k],
                              dbField: columns[c],
                            })
                          }
                          break
                        }

                        if (columns[c].fieldType == 'float') {
                          byUser += Number(fields[k].value) + ', '
                          if (!Number(fields[k].value)) {
                            anomaly.push({
                              yourField: fields[k],
                              dbField: columns[c],
                            })
                          }
                          break
                        }

                        if (columns[c].fieldType == 'datetime') {
                          byUser += "'" + fields[k].value + "', "
                          if (isNaN(new Date(fields[k].value))) {
                            anomaly.push({
                              yourField: fields[k],
                              dbField: columns[c],
                            })
                          }
                          break
                        }

                        if (fields[k].fieldName.indexOf('token') > -1) {
                          byUser += "sha1('" + fields[k].value.trim() + "'), "
                          if (fields[k].value.length < 6) {
                            anomaly.push({
                              yourField: fields[k],
                              dbField: columns[c],
                            })
                          }

                          break
                        }

                        if (columns[c].fieldType == 'text') {
                          byUser += "'" + fields[k].value + "', "
                          break
                        }
                        byUser += "'" + fields[k].value + "', "
                      }
                    }
                  }

                  if (anomaly.length === 0 && fields.length == columns.length) {
                    execSQL(
                      'insert into ' +
                      body.table +
                      '  ' +
                      byDB +
                      ' values (null, ' +
                      byUser +
                      ' now(), now())',
                      res
                    )
                  } else {
                    res.send({
                      message: 'Invalid fields!',
                      Details: anomaly,
                      ExpectedFields: columns,
                      YourFields: fields,
                    })
                  }
                } else {
                  res.send({ message: 'Invalid fields!', Details: error })
                }
              }
            )
          } else {
            res.send({ message: 'Business tables not authorized!' })
          }
        }
      } else {
        res.send({ message: 'Invalid fields!', Details: error })
      }
    }
  )
}

//==========================================================================================================

// Insere novo usuário contanto que não exista outro com mesmo e-mail
/* Parametros: 
        body= {
            'table'; 'users_clients' ou 'users_masters' ou 'users_affiliates', 
            'prefix': 'NOME DA TABELA SEM O 's' NO FIM. EX.: 'users_master', 
            'mail': 'E-MAIL DO NOVO USUÁRIO',
            'fields': 'ARRAY COM TODOS OS CAMPOS DA TABELA E SEUS RESPECTIVOS VALORES, EX.: 
                        [
                                {"fieldName":"users_client_affiliate_id" , "value": 1},  ==> Valor informado pelo ambiente da loja em questão ao ser acessada!
                                {"fieldName":"users_client_name" , "value": "Ronan Rodrigues"},
                                {"fieldName":"users_client_mail" , "value": "meuEmail@meuemail.com"},
                                {"fieldName":"users_client_token" , "value": "minhasenhaValida"},
                                {"fieldName":"users_client_cpf" , "value": 123456789102},
                                {"fieldName":"users_client_endereco" , "value": "Rua XXXX Nº XXXX"},
                                {"fieldName":"users_client_cep" , "value": "29000000"},
                                {"fieldName":"users_client_bairro" , "value": "Jacupemba"},
                                {"fieldName":"users_client_listas_compras" , "value": "Principal"},
                                {"fieldName":"users_client_cidade" , "value": "Aracruz"}
                        ]
            }
    Respostas:
            'Success' com os valores fieldCount, affectedRows, insertId, serverStatus e warningCount
            'Error' status 500, 'Internal Server Error' com 'responseJSON' => responseJSON: {message: "User mail already exists!"} ou Details: {'ExpectedFields: [Array], YourFields: [Array]}

*/
module.exports.newClientLoginInsert = function (body, res) {
  console.log('body')
  console.log(body)
  if (body.prefix != 'users_client') {
    console.log('cai na exceção')
    res.status(500).json({ message: 'Managers users is blocked!' })
  } else {
    console.log(
      'select * from ' +
      body.table +
      ' where ' +
      body.prefix +
      "_mail = '" +
      body.mail +
      "' "
    )
    conn.query(
      'select * from ' +
      body.table +
      ' where ' +
      body.prefix +
      "_mail =  '" +
      body.mail +
      "' ",
      async function (error, results, fields2) {
        if (!error) {
          console.log(results)
          if (results.length > 0) {
            console.log('usuario ja existe')
            res.status(500).json({ message: 'User mail already exists!' })
          } else {
            if (body.table.indexOf('user') > -1) {
              conn.query(
                'desc ' + body.table,
                async function (error, results, fields3) {
                  if (!error) {
                    var columns = [],
                      byUser = '',
                      byDB = ' ('

                    for (const k in results) {
                      byDB += results[k].Field + ', '
                      if (
                        results[k].Field != 'id' &&
                        results[k].Field != 'updatedAt' &&
                        results[k].Field != 'createdAt'
                      ) {
                        columns.push({
                          fieldName: results[k].Field,
                          fieldType: results[k].Type,
                        })
                      }
                    }
                    byDB += ') '
                    byDB = byDB.replace(', )', ')')
                    var fields = body.fields,
                      anomaly = []
                    for (const k in fields) {
                      for (const c in columns) {
                        if (fields[k].fieldName === columns[c].fieldName) {
                          if (columns[c].fieldType == 'int(11)') {
                            byUser += Number(fields[k].value) + ', '
                            if (!Number(fields[k].value)) {
                              anomaly.push({
                                yourField: fields[k],
                                dbField: columns[c],
                              })
                            }
                            break
                          }

                          if (columns[c].fieldType == 'float') {
                            byUser += Number(fields[k].value) + ', '
                            if (!Number(fields[k].value)) {
                              anomaly.push({
                                yourField: fields[k],
                                dbField: columns[c],
                              })
                            }
                            break
                          }

                          if (columns[c].fieldType == 'datetime') {
                            byUser += "'" + fields[k].value + "', "
                            if (isNaN(new Date(fields[k].value))) {
                              anomaly.push({
                                yourField: fields[k],
                                dbField: columns[c],
                              })
                            }
                            break
                          }

                          if (fields[k].fieldName.indexOf('token') > -1) {
                            byUser += "sha1('" + fields[k].value + "'), "
                            break
                          }

                          if (columns[c].fieldType == 'text') {
                            byUser += "'" + fields[k].value + "', "
                            break
                          }
                          byUser += "'" + fields[k].value + "', "
                        }
                      }
                    }

                    if (
                      anomaly.length === 0 &&
                      fields.length == columns.length
                    ) {
                      console.log('tudo ocorreu bem!')
                      execSQL(
                        'insert into ' +
                        body.table +
                        '  ' +
                        byDB +
                        ' values (null, ' +
                        byUser +
                        ' now(), now())',
                        res
                      )
                    } else {
                      console.log('anomaly')
                      console.log(anomaly)
                      console.log('columns')

                      res.status(500).json({
                        message: 'Invalid fields!',
                        Details: anomaly,
                        ExpectedFields: columns,
                        YourFields: fields,
                      })
                    }
                  } else {
                    console.log(error)
                    res.send(error)
                  }
                }
              )
            } else {
              console.log('business')
              res
                .status(500)
                .json({ message: 'Business tables not authorized!' })
            }
          }
        } else {
          console.log(error)
          res.send(error)
        }
      }
    )
  }
}

//==========================================================================================================

// Altera a senha conforme e-mail enviado
/*
body= {
            'table'; 'users_clients' ou 'users_masters' ou 'users_affiliates',
            'prefix': 'NOME DA TABELA SEM O 's' NO FIM. EX.: 'users_master', 
            'token_me': 'CHAVE TOKEN TO USUÁRIO ENVIADO NO E-MAIL DE RECUPERAÇÃO DE SENHA', 
            'mail': 'E-MAIL DO NOVO USUÁRIO', 
       }
Respostas:
            'Success' com os valores fieldCount, affectedRows, insertId, serverStatus e warningCount
*/
module.exports.recoverPassword = function (body, res) {
  conn.query(
    'select * from ' +
    body.table +
    ' where sha1(id,' +
    body.prefix +
    "_mail) =  '" +
    body.token_me +
    "'",
    async function (error, results, fields) {
      if (results.length > 0) {
        if (body.new_token && body.prefix && body.table) {
          execSQL(
            'update ' +
            body.table +
            ' set ' +
            body.prefix +
            "_token = sha1('" +
            body.new_token +
            "') where id = '" +
            body.user_id +
            "'",
            res
          )
        } else {
          res
            .status(500)
            .json({ message: 'Invalid parameters!', Details: body })
        }
      } else {
        res.status(500).json({ message: 'Invalid parameters!', Details: body })
      }
    }
  )
}

module.exports.alteraSenhaUsuarioNovo = function (body, res) {
  conn.query(
    `select * from users_clients where id = ${body.user_id}`,
    async function (error, results, fields) {
      if (results.length > 0) {
        if (
          body.user_id != 0 &&
          body.user_id != null &&
          body.user_id != '' &&
          body.user_id != undefined
        ) {
          execSQL(
            `update users_clients set users_client_token = sha1('${body.new_password}') where id = ${body.user_id}`,
            res
          )
        } else {
          res
            .status(500)
            .json({ message: 'Invalid parameters!', Details: body })
        }
      } else {
        res.status(500).json({ message: 'Invalid parameters!', Details: body })
      }
    }
  )
}

module.exports.deleteUserAffiliate = function (body, res) {
  if (body.userName) {
    execSQL(
      'delete from users_affiliates where users_affiliate_name = "' +
      body.userName +
      '"',
      res
    )
  } else {
    res.status(500).json({ message: 'Invalid parameters!', Details: body })
  }
}

module.exports.updateRulesUser = function (body, res) {
  if (body.dataUser != undefined) {
    if (!Number(body.dataUser.id)) {
      let sql = 'insert into users_profiles values ('
      sql += 'null,'
      sql += body.dataUser.master_id + ','
      sql += '"' + body.dataUser.profile_type + '",'
      sql += body.dataUser.dashboard + ','
      sql += body.dataUser.vendas_status + ','
      sql += body.dataUser.vendas_alterar_pedidos + ','
      sql += body.dataUser.vendas_cancelar_pedidos + ','
      sql += body.dataUser.vendas_editar_status_pedidos + ','
      sql += body.dataUser.vendas_informacoes_clientes + ','
      sql += body.dataUser.produtos_status + ','
      sql += body.dataUser.produtos_editar_produtos + ','
      sql += body.dataUser.produtos_excluir_produtos + ','
      sql += body.dataUser.produtos_alterar_massa + ','
      sql += body.dataUser.produtos_criar_promocoes + ','
      sql += body.dataUser.categorias_status + ','
      sql += body.dataUser.categorias_criar_categorias + ','
      sql += body.dataUser.categorias_excluir_categorias + ','
      sql += body.dataUser.categorias_editar_categorias + ','
      sql += body.dataUser.categorias_editar_banners + ','
      sql += body.dataUser.subcategorias_status + ','
      sql += body.dataUser.subcategorias_criar_categorias + ','
      sql += body.dataUser.subcategorias_excluir_categorias + ','
      sql += body.dataUser.subcategorias_editar_categorias + ','
      sql += body.dataUser.subcategorias_editar_banners + ','
      sql += body.dataUser.promocoes_status + ','
      sql += body.dataUser.promocoes_criar_regras_preco + ','
      sql += body.dataUser.promocoes_editar_regras_preco + ','
      sql += body.dataUser.cupons_status + ','
      sql += body.dataUser.cupons_criar + ','
      sql += body.dataUser.cupons_editar + ','
      sql += body.dataUser.emails_status + ','
      sql += body.dataUser.emails_criar + ','
      sql += body.dataUser.emails_editar + ','
      sql += body.dataUser.logistica_status + ','
      sql += body.dataUser.logistica_alterar_conf_gerais + ','
      sql += body.dataUser.logistica_alterar_metodos + ','
      sql += body.dataUser.conteudo_status + ','
      sql += body.dataUser.busca_status + ','
      sql += body.dataUser.busca_alterar_conf_gerais + ','
      sql += body.dataUser.busca_alterar_metodos + ','
      sql += body.dataUser.recomendacao_status + ','
      sql += body.dataUser.recomendacao_alterar_vitrines + ','
      sql += body.dataUser.recomendacao_alterar_banners + ','
      sql += body.dataUser.recomendacao_criar_segmentacoes + ','
      sql += body.dataUser.settings_status + ','
      sql += body.dataUser.settings_criar_unidade + ','
      sql += body.dataUser.settings_desativar_unidade + ','
      sql += body.dataUser.pagamento_status + ','
      sql += body.dataUser.pagamento_alterar_meios + ','
      sql += body.dataUser.pagamento_criar_meios + ','
      sql += body.dataUser.tag_manager_status + ','
      sql += body.dataUser.estoque_status + ','
      sql += body.dataUser.xml_status + ','
      sql += body.dataUser.email_status + ','
      sql += 'now(),'
      sql += 'now())'

      execSQL(sql, res)
    } else {
      let sql = 'update users_profiles set '
      for (const k in body.dataUser) {
        if (
          Number(body.dataUser[k]) ||
          body.dataUser[k] == null ||
          body.dataUser[k] == 'null'
        ) {
          let value = body.dataUser[k]
          if (value == null || value == 'null') {
            value = 0
          }
          sql += k + ' = ' + value + ', '
        } else {
          if (k == 'createdAt' || k == 'updatedAt') {
            sql += k + ' = now(), '
          } else {
            let value2 = body.dataUser[k]
            if (value2 == '') {
              value2 = 0
            } else {
              value2 = '"' + value2 + '"'
            }
            sql += k + ' = ' + value2 + ', '
          }
        }
      }

      sql += '&'
      sql = sql.replace(', &', '')
      sql +=
        ' where id = ' +
        body.dataUser.id +
        ' and master_id = ' +
        body.dataUser.master_id

      execSQL(sql, res)
    }
  } else {
    res.status(500).json({ message: 'Invalid parameters!', Details: body })
  }
}

module.exports.getClientsUsersFromAffiliate = function (body, res) {
  if (body.affiliate_id != undefined) {
    let sql =
      'select * from users_clients where users_client_affiliate_id = ' +
      body.affiliate_id
    execSQL(sql, res)
  } else {
    res.status(500).json({ message: 'Invalid parameters!', Details: body })
  }
}
