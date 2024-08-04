/* eslint-disable no-inner-declarations */
/*========= SMARTCOMMERCI BUSINESS ========== 

Author: Ronan Rodrigues
Contact: Tel.: 27 996011204, Mail: ronan.rodrigues@pullup.tech
Objective: Consultar e alterar os dados conforme as regras do negócio

============================================*/

// Importando os modelos
var masters = require('../models/masters')
var affiliates = require('../models/affiliates')
var carts = require('../models/carts')
var orders = require('../models/orders')
var posts = require('../models/posts')
var listas_compras = require('../models/listas_compras')
var products = require('../models/products')
const jwt = require('jsonwebtoken')
const mysql = require('mysql2')
const nodemailer = require('nodemailer')
var moment = require('moment')
const fs = require('fs')

var builder = require('xmlbuilder')
//const fetch = require('node-fetch')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))
var axios = require('axios')
const { brotliDecompress } = require('zlib')

// Importando as variaveis de ambiente
require('dotenv').config()

//==========================================================================================================

// Configurando uma conexão com o database
const databaseConfig = {
  host: process.env.host_db,
  port: process.env.port_db,
  user: process.env.user_db,
  password: process.env.password_db,
  database: process.env.database_db,
}
console.log({ databaseConfig })
const conn = mysql.createConnection(databaseConfig)

//==========================================================================================================

// Função para executar um comando SQL
async function execSQL(query, res) {
  conn.query(query, async function (error, results, fields) {
    if (!error) {
      //console.log({ query, results })
      res.send(results)
    } else {
      console.log({ query, error })
      res.send(error)
    }
  })
}

//==========================================================================================================


function gerarPassword() {
  return Math.random().toString(36).slice(-10)
}

module.exports.usuariosAcessosAdd = function (body, res) {
  if (body.lista_emails && body.master_id) {
    var LISTA_RECEBIDA = body.lista_emails,
      senha = gerarPassword()
    var listaConvidados = []
    var listaQuerys = []
    function confereSenha(mail) {
      for (const k in listaConvidados) {
        if (listaConvidados[k].mail == mail) {
          return listaConvidados[k].mail
        }
      }
      return gerarPassword()
    }
    for (const k in LISTA_RECEBIDA) {
      var thisQUery = ''
      thisQUery = 'insert into users_affiliates values '
      var mails = LISTA_RECEBIDA[k].mails
      for (const a in mails) {
        var thisSenha = confereSenha(senha)
        thisQUery +=
          '(null, ' +
          body.master_id +
          ', ' +
          LISTA_RECEBIDA[k].AFFILIATE_ID +
          ', "' +
          mails[a] +
          '", "' +
          LISTA_RECEBIDA[k].type[0] +
          '", "' +
          mails[a] +
          '", sha1("' +
          thisSenha +
          '"),now(), now()),'
        listaConvidados.push({ mail: mails[a], senha: thisSenha })
      }
      var fim = '&'
      thisQUery += fim
      thisQUery = thisQUery.replace(',&', '')
      listaQuerys.push(thisQUery)
      conn.query(thisQUery, async function (error, results, fields) {
        if (!error) {
          console.log(results)
        } else {
          console.log(error)
        }
      })
    }
    var listaDisparados = []
    function confereDisparados(mail) {
      for (const k in listaDisparados) {
        if (listaDisparados[k] == mail) {
          return false
        }
      }
      return true
    }
    for (const k in listaConvidados) {
      if (confereDisparados(listaConvidados[k].mail)) {
        sendMailSendgrid({
          to: listaConvidados[k].mail,
          from: 'no-reply@smartcomerci.com.br',
          subject: 'Informações de acesso ao Smartcomerci',
          html:
            'Seja bem vindo ao Smartcomerci!<br><br><hr>Utilize os seguintes dados para acessar:<br><br>E-mail: <b>' +
            listaConvidados[k].mail +
            '</b><br>Senha: <b>' +
            listaConvidados[k].senha +
            '</b>',
        })
        listaDisparados.push(listaConvidados[k].mail)
      }
    }
    res.send({
      mensagem: 'E-mails cadastrados e informados da senha!',
      json: listaQuerys,
    })
  } else {
    res.status(500).json({ message: 'Invalid parameters!', Details: body })
  }
}

//==========================================================================================================

// Acionamento dos modelos 'findAll' do sequelize
// module.exports.masters = function (err, res) {
//   masters.findAll().then((data) => {
//     if (!err) {
//       res.send(data);
//     }
//   });
// };

// Acionamento dos modelos 'findAll' do sequelize
module.exports.updateMailMarketingContent = async function (body, res) {
  if (body.master_id && body.fields) {
    let changes = body.fields
    for (const k in changes) {
      let sql = `update emails_marketing set ${changes[k].column} = '${changes[k].value}' where master_id = ${body.master_id} and tipo_email = '${changes[k].tipo_email}'`
      miniQuery(sql)
    }
    res.status(200).json({
      alteracoes: 'OK',
      body,
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.getXmlFile = async function (body, res) {
  console.log(body)
  if (body.affiliate_id) {
    conn.query(
      `select distinct product_code,  product_site_description,  product_site_categories,  product_site_ean   from product_details   where  product_affiliate_id = ${body.affiliate_id} and product_status = 'active';`,
      async function (error, results, fields) {
        if (!error) {
          let PRODUTOS = JSON.parse(JSON.stringify(results))
          console.log('total de itens buscados', PRODUTOS.length)

          let books = PRODUTOS,
            columns = [
              'product_code',
              'product_descricao',
              'product_categoria',
              'product_ean',
              'product_thumbnail',
              'product_site_tags',
              'product_site_description',
            ]

          try {
            var xml = builder.create('bookstore')
            for (var i = 0; i < books.length; i++) {
              // xml.ele('book')
              // .ele('name', {'lang': books[i]['language']}, books[i]['name']).up()
              // .ele('price', books[i]['price']).up()
              // .ele('category', books[i]['category']).up()
              // .ele('author', books[i]['author']).up()
              // .ele('ISBN', books[i]['ISBN']).up()
              // .ele('publish_date', books[i]['publish_date']).end();
              xml.ele('book')
              for (var k = 0; k < columns.length - 1; k++) {
                xml.ele(columns[k], books[i][columns[k]]).up()
              }
              xml
                .ele(
                  columns[columns.length - 1],
                  books[i][columns[columns.length - 1]]
                )
                .end()
            }

            var xmldoc = xml.toString({ pretty: true })

            fs.writeFile(__dirname + '/export.xml', xmldoc, function (err) {
              if (err) {
                return console.log(err)
              }
              console.log('The file was saved!')
              console.log({
                msg: 'success',
                contentPath: __dirname + '/export.xml',
              })

              res.sendFile(__dirname + '/export.xml')
            })
          } catch (erro) {
            console.log({ msg: 'erro', contentPath: JSON.stringify(erro) })
            res
              .status(500)
              .json({ msg: 'erro', contentPath: JSON.stringify(erro) })
          }
        } else {
          console.log(error)
          res
            .status(500)
            .json({ msg: 'error', errorString: JSON.stringify(error) })
        }
      }
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.getMyLinksBanners = async function (body, res) {
  if (body.affiliate_id) {
    let SQL = `select distinct url, referencia, id_origin, column_origin, table_origin, updatedAt,createdAt from links where affiliate_id = ${body.affiliate_id}`
    execSQL(SQL, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.sendMailTest = async function (body, res) {
  console.log(body)
  if (body.message != undefined) {
    console.log(body.message)
    const resultadoEnvio = await sendMailSendgrid(body.message)
    console.log(resultadoEnvio)
    res.send({ resultado: 'ok', log: resultadoEnvio })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.sendMailTestFROM = async function (body, res) {
  if (body.message != undefined) {
    console.log(body.message)
    const resultadoEnvio = await sendMailSendgridTESTE(body.message)
    console.log(resultadoEnvio)
    res.send({ resultado: 'ok', log: resultadoEnvio })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

// Rota update individual
module.exports.singleUpdate = function (body, res) {
  if (body.idValue != undefined) {
    execSQL(
      'update ' +
      body.table +
      ' set ' +
      body.column +
      ' = "' +
      body.newValue +
      '" where  ' +
      body.columnId +
      ' = ' +
      body.idValue,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Rota update individual
module.exports.getSingleTable = function (body, res) {
  if (
    body.idName != undefined &&
    body.idValue != undefined &&
    body.table != undefined &&
    body.order != undefined &&
    body.limit != undefined
  ) {
    execSQL(
      'select * from ' +
      body.table +
      ' where ' +
      body.idName +
      ' = ' +
      body.idValue +
      ' order by ' +
      body.order +
      ' limit ' +
      body.limit,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Rota update individual
module.exports.getRealatedsDefault = function (body, res) {
  //console.log(body)
  if (
    body.category != undefined &&
    body.product_code != undefined &&
    body.affiliate_id != undefined
  ) {
    let sql = `select distinct product_code from  product_details where product_code != ${body.product_code} and  product_site_categories like '%${body.category}%' and product_affiliate_id = ${body.affiliate_id} and product_status = 'active'   limit 5`
    execSQL(sql, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

//

// Rota update individual
module.exports.getMasterInfo = function (body, res) {
  if (body.masterId != undefined) {
    execSQL('select * from masters where id = ' + body.masterId, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.updateMastersTable = function (body, res) {
  if (
    body.master_id != undefined &&
    body.field != undefined &&
    body.value != undefined
  ) {
    execSQL(
      `update masters set ${body.field} = '${body.value}' where id = ${body.master_id}`,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Rota update individual
module.exports.getByTableName = function (body, res) {
  if (
    body.masterId != undefined &&
    body.idName != undefined &&
    body.tableName != undefined
  ) {
    execSQL(
      'select * from ' +
      body.tableName +
      ' where ' +
      body.idName +
      ' = ' +
      body.masterId,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Rota update individual
module.exports.getMarketInfo = function (body, res) {
  if (body.masterId != undefined) {
    execSQL(
      'select * from emails_marketing where master_id = ' + body.masterId,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

function getTitleEmailFromStatus(status) {
  switch (status) {
    case 0:
      return 'Pedido Cancelado'
    case 1:
      return 'Pedido concluído'
    case 2:
      return 'Pedido em separação'
    case 3:
      return 'Pedido enviado'
    case 4:
      return 'Pedido recebido'
    default:
      break
  }
  return null
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.maisUmaCategoria = function (body, res) {
  if (body.master_id != undefined && body.affiliate_id != undefined) {
    execSQL(
      'insert into affiliate_sub_categories (id,affiliate_master_id, affiliate_id,affiliate_categorie_name,affiliate_sub_categorie_name,' +
      'affiliate_sub_categorie_status,affiliate_categorie_status, categorie_icon) values (1,' +
      body.master_id +
      ',' +
      body.affiliate_id +
      ",'EDITE ESTE CAMPO','EDITE ESTE CAMPO SUB', 0, '[]','images/icons/frutas.png')",
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.clearByMasterId = function (body, res) {
  if (
    body.table != undefined &&
    body.prefix != undefined &&
    body.master_id != undefined
  ) {
    execSQL(
      'delete from ' +
      body.table +
      ' where ' +
      body.prefix +
      '_master_id = ' +
      body.master_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.deleteById = function (body, res) {
  if (
    body.table != undefined &&
    body.item_id != undefined &&
    Number(body.item_id)
  ) {
    execSQL(`delete from ${body.table} where id = ${body.item_id}`, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.alterList = function (body, res) {
  var acao = ''

  if (
    body.lista != undefined &&
    body.affiliate_id != undefined &&
    body.acao != undefined
  ) {
    var codes = ''
    for (const k in body.lista) {
      codes +=
        ' product_affiliate_id = ' +
        body.affiliate_id +
        ' and product_code = ' +
        body.lista[k].product_code +
        ' or'
    }
    switch (body.acao) {
      case 'deletar':
        acao =
          'delete from products where ' + codes + ' limit ' + body.lista.length
        acao = acao.replace(/or limit/g, ' limit')
        break
      case 'ativar':
        acao =
          'update product_details set product_status = "active" where ' +
          codes +
          ' limit ' +
          body.lista.length
        acao = acao.replace(/or limit/g, ' limit')
        break
      case 'desativar':
        acao =
          'update product_details set product_status = "inactive" where ' +
          codes +
          ' limit ' +
          body.lista.length
        acao = acao.replace(/or limit/g, ' limit')
        break

      default:
        break
    }
    if (acao != '') {
      execSQL(acao, res)
    } else {
      res.send('Nenhum produto ou acao selecionados')
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Acionamento dos modelos 'findAll' do sequelize
module.exports.deleteAffiliate = function (body, res) {
  if (body.master_id != undefined && body.affiliate_id) {
    execSQL(
      'delete from affiliates where id = ' +
      body.affiliate_id +
      ' and  affiliates_master_id = ' +
      body.master_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Coletando pedidos

function ajustaPedidos() {
  let sql = `update orders set order_conteudo = replace(order_conteudo, '"{','{')`
  let sql1 = `update orders set order_conteudo = replace(order_conteudo, '}"','}')`
  let sql2 = `update orders set order_conteudo = replace(order_conteudo, '\\n','')`
  let sql3 = `update orders set order_conteudo = replace(order_conteudo, '\\r','')`
  let sql5 = `update orders set order_conteudo = replace(order_conteudo, '"[','[')`
  let sql6 = `update orders set order_conteudo = replace(order_conteudo, ']"',']')`

  sqlVoid(sql)
  sqlVoid(sql1)
  sqlVoid(sql2)
  sqlVoid(sql3)
  sqlVoid(sql5)
  sqlVoid(sql6)
}

module.exports.getMyOrders = function (body, res) {
  ajustaPedidos()
  if (body.affiliate_id != undefined && body.client_id != undefined) {
    var sql =
      'select * from orders where order_affiliate_id = ' +
      body.affiliate_id +
      ' and order_client_id = ' +
      body.client_id
    //console.log(sql);
    execSQL(sql, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Atualiza o carrinho
module.exports.updateCart = function (body, res) {
  if (body.affiliate_id != undefined && body.client_id != undefined) {
    var sql =
      'select * from carts where cart_affiliate_id = ' +
      body.affiliate_id +
      ' and cart_client_id = ' +
      body.client_id
    console.log(sql)
    conn.query(sql, async function (error, results, fields) {
      if (!error) {
        if (results.length > 0) {
          var sql2 =
            "update carts set cart_conteudo = '" +
            body.cart_conteudo +
            "' where cart_affiliate_id = " +
            body.affiliate_id +
            ' and cart_client_id = ' +
            body.client_id
          console.log(sql2)
          execSQL(sql2, res)
        } else {
          var sql3 =
            'insert into carts values (null , ' +
            body.affiliate_id +
            ',' +
            body.client_id +
            ',' +
            1 +
            ", '" +
            body.cart_conteudo +
            "', 0, now(), now())"
          console.log(sql3)
          execSQL(sql3, res)
        }
      } else {
        res
          .status(500)
          .json({ message: 'Invalid data parameters!', youtParameters: body })
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Coletando carrinho
module.exports.getMyCart = function (body, res) {
  console.log('getMyCart', body)
  //console.log(body);
  if (body.client_id === 0 || body.client_id === '0') {
    res.status(200).json([])
  } else {
    if (body.affiliate_id != undefined && body.client_id != undefined) {
      var sql =
        'select * from carts where cart_affiliate_id = ' +
        body.affiliate_id +
        ' and cart_client_id = ' +
        body.client_id
      console.log(sql)
      execSQL(sql, res)
    } else {
      console.log('----------------------------ERRRO')
      res
        .status(500)
        .json({ message: 'Invalid data parameters!', youtParameters: body })
    }
  }
}

// Pegando informações da loja afiliada
// module.exports.getStoreInformation = function (body, res) {
//   console.log('store information', body)
//   if (body.master_id != undefined) {
//     let query =
//       'select * from   masters inner join delivery_default inner join affiliates where  masters.id = delivery_default.master_id and masters.id = affiliates.affiliates_master_id and masters.id = ' +
//       body.master_id
//     conn.query(query, async function (error, results, fields) {
//       if (!error) {
//         console.log({ query, results })
//         res.send(results)
//       } else {
//         console.log({ query, error })
//         res.send(error)
//       }
//     })
//   } else {
//     console.log('----------------------------ERRRO')
//     res
//       .status(500)
//       .json({ message: 'Invalid data parameters!', youtParameters: body })
//   }
// }

// Pegando informações da loja afiliada
module.exports.getStoreInformation = async function (body, res) {
  if (body.master_id != undefined) {
    try {
      const query =
        `SELECT * FROM masters  INNER JOIN delivery_default  INNER JOIN affiliates  WHERE masters.id = delivery_default.master_id  AND masters.id = affiliates.affiliates_master_id  AND masters.id = ?`;

      const results = await executeQuerySmart(query, [body.master_id])

      console.log({ query, results })
      res.send(results)
    } catch (error) {
      console.error({ error })
      res
        .status(500)
        .json({ message: 'An error occurred', error: error.message })
    }
  } else {
    res
      .status(400)
      .json({ message: 'Invalid data parameters!', yourParameters: body })
  }
}

async function executeQuerySmart(query, params) {
  return new Promise((resolve, reject) => {
    conn.query(query, params, (error, results, fields) => {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

// Pegando informações de um produto específico
module.exports.getProductInformation = function (body, res) {
  if (body.affiliate_id != undefined && body.product_code != undefined) {
    const folder =
      './public/images/' + body.affiliate_id + '/' + body.product_code
    const folderExport = 'images/' + body.affiliate_id + '/' + body.product_code
    console.log(folder)
    var listaImgens = [],
      texto = ''

    if (!fs.existsSync(folder)) {
      texto = '[]'
      var sql =
        "select distinct *,'" +
        texto +
        "' as uploadImages from products inner join product_details where products.product_affiliate_id = product_details.product_affiliate_id " +
        'and products.product_code = ' +
        body.product_code +
        ' and product_details.product_code = ' +
        body.product_code +
        '  and products.product_affiliate_id = ' +
        body.affiliate_id +
        ' limit 1'
      console.log(sql)
      execSQL(sql, res)
    } else {
      fs.readdir(folder, (err, files) => {
        var listNames = []
        files.forEach((file) => {
          listNames.push(folderExport + '/' + file)
        })

        console.log(listNames)
        console.log(JSON.stringify(listNames))
        texto = JSON.stringify(listNames)
        var sql =
          "select distinct *,'" +
          texto +
          "' as uploadImages from products inner join product_details where products.product_affiliate_id = product_details.product_affiliate_id " +
          'and products.product_code = ' +
          body.product_code +
          ' and product_details.product_code = ' +
          body.product_code +
          '  and products.product_affiliate_id = ' +
          body.affiliate_id +
          ' limit 1'
        console.log(sql)
        execSQL(sql, res)
      })
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Update dos delivery defaults
module.exports.updateDeliveryDefault = function (body, res) {
  if (
    body.affiliate_id != undefined &&
    body.fieldName != undefined &&
    body.fieldValue != undefined
  ) {
    execSQL(
      'update delivery_default set ' +
      body.fieldName +
      " = '" +
      body.fieldValue +
      "' where affiliate_id = " +
      body.affiliate_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Update dos delivery defaults
module.exports.updateCategorieDetail = function (body, res) {
  if (
    body.master_id != undefined &&
    body.fieldName != undefined &&
    body.fieldValue != undefined &&
    body.categorie_name != undefined
  ) {
    let SQL =
      'update affiliate_sub_categories set ' +
      body.fieldName +
      " = '" +
      body.fieldValue +
      "' where affiliate_categorie_name = '" +
      body.categorie_name +
      "' and affiliate_master_id = " +
      body.master_id
    console.log('ESSA é a UERY: ', SQL)
    miniQuery(SQL)
    execSQL(SQL, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Atualizando a lista de categorias
module.exports.updateCategoryList = function (body, res) {
  if (
    body.categorias != undefined &&
    body.categorias.length > 0 &&
    body.master_id != undefined &&
    body.affiliate_id != undefined
  ) {
    conn.query(
      'delete from affiliate_sub_categories where affiliate_master_id = ' +
      body.master_id,
      async function (error, results, fields) {
        if (!error) {
          var endFix = '#'
          var categorias = body.categorias,
            query =
              'insert into affiliate_sub_categories (id, affiliate_id, affiliate_master_id, affiliate_categorie_name, affiliate_sub_categorie_name, affiliate_sub_categorie_status, affiliate_categorie_status, categorie_icon,subcategorie_banners,categorie_key_words) values '
          for (const k in categorias) {
            query +=
              '(null, ' +
              body.affiliate_id +
              ',' +
              body.master_id +
              ", '" +
              categorias[k].categoria +
              "', '" +
              categorias[k].subCategorias +
              "', '" +
              categorias[k].cat_status +
              "','" +
              categorias[k].sub_status +
              "','" +
              categorias[k].icone +
              "','" +
              categorias[k].subcategorie_banners +
              "','" +
              categorias[k].categorie_key_words +
              "'),"
          }
          query += endFix
          query = query.replace(',#', '')
          conn.query(query, async function (error2, results, fields) {
            if (!error2) {
              res.send({ updateMessage: 'update sucefully!' })
            } else {
              res.send(error2)
            }
          })
        } else {
          miniQuery(
            `update affiliate_sub_categories set subcategorie_banners = replace(subcategorie_banners, '"{','{')`
          )
          miniQuery(
            `update affiliate_sub_categories set subcategorie_banners = replace(subcategorie_banners, '}"','}')`
          )
          miniQuery(
            `update affiliate_sub_categories set affiliate_sub_categorie_name = '' where affiliate_sub_categorie_name  = '?,'`
          )

          res.send(error)
        }
      }
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Listando categorias em sequencia personalizada
module.exports.getCatList = function (body, res) {
  if (body.affiliate_id != undefined && body.master_id != undefined) {
    var limit = ' '
    if (body.limit != undefined) {
      limit = ' limit ' + body.limit
    }
    var sql =
      'select  *, affiliate_categorie_name as categoria,affiliate_sub_categorie_name as subCategorias,affiliate_sub_categorie_status,affiliate_categorie_status ' +
      'from affiliate_sub_categories where   affiliate_master_id = ' +
      body.master_id +
      ' order by id ASC ' +
      limit
    execSQL(sql, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// Listando categorias em sequencia personalizada

function sqlVoid(sql) {
  //console.log("void", sql)
  conn.query(sql, async function (error, results, fields) {
    if (!error) {
      console.log(results)
    } else {
      console.log(error)
    }
  })
}
module.exports.setHomePage = function (body, res) {
  if (
    body.master_id != undefined &&
    body.master_id != '' &&
    body.listaHome != undefined
  ) {
    let dados = body.listaHome

    let sql1 = `delete from  home_pages where master_id = ${body.master_id}`
    conn.query(sql1, async function (error, results, fields) {
      if (!error) {
        console.log(dados)
        for (const k in dados) {
          if (dados[k].listaBanners1 != undefined) {
            if (dados[k].listaBanners1.indexOf('http') > -1) {
              let sql2 = `insert into home_pages values (null, ${body.master_id}, "banners", "${dados[k].listaBanners1}",  "${dados[k].listaBanners2}", "", now(), now())`
              sqlVoid(sql2)
            } else {
              let sql2 = `insert into home_pages values (null, ${body.master_id}, "banners", "http://localhost:6060/images/${body.master_id}/${dados[k].listaBanners1}",  "http://localhost:6060/images/${body.master_id}/${dados[k].listaBanners2}", "", now(), now())`
              sqlVoid(sql2)
            }
          } else {
            let sql3 = `insert into home_pages values (null, ${body.master_id}, "products", "",  "", "${dados[k].listaProdutos}", now(), now())`
            sqlVoid(sql3)
          }
        }
        res.status(200).json({ 'message ok': 'alterações realizadas' })
      } else {
        res.status(500).json({ 'message error': error })
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.affiliates = function (body, res) {
  if (
    body.affiliate_id != undefined &&
    body.affiliate_id != 'undefined' &&
    body.affiliate_id != '' &&
    Number(body.affiliate_id)
  ) {
    execSQL(
      'select * from affiliates where affiliates_master_id = ' +
      body.affiliate_id,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.carts = function (err, res) {
  carts.findAll().then((data) => {
    if (!err) {
      res.send(data)
    }
  })
}

module.exports.posts = function (err, res) {
  posts.findAll().then((data) => {
    if (!err) {
      res.send(data)
    }
  })
}

module.exports.tables = function (body, res) {
  execSQL(
    'select distinct * from products where ' +
    body.table +
    ' = ' +
    body.affiliate_id +
    ' limit ' +
    body.lastID +
    ',' +
    body.totalItems,
    res
  )
}

module.exports.tagsMarcas = function (body, res) {
  if (body.affiliate_id != undefined) {
    conn.query(
      'select distinct(product_site_tags) as tags from product_details',
      async function (error, results, fields) {
        if (!error) {
          conn.query(
            'select distinct(product_site_fabricacao) as marcas from product_details',
            async function (error2, results2, fields) {
              if (!error2) {
                res.send({ tags: results, marcas: results2 })
              } else {
                res.send(error2)
              }
            }
          )
        } else {
          res.send(error)
        }
      }
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.findByCode = function (body, res) {
  if (body.affiliate_id != undefined && body.product_code != undefined) {
    let query = `select distinct * from products where product_code = ${body.product_code} and product_affiliate_id = ${body.affiliate_id}`
    execSQL(query, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

function updatePrices() {
  let query = `update product_details inner join products set product_details.product_site_value = products.product_valor where cast(products.product_code as unsigned integer) = cast(product_details.product_code as unsigned integer)`
  miniQuery(query)
  console.log('atualizei preços...')
}

module.exports.products = function (body, res) {
  let lista11 = [
    `update product_details set product_site_related_code = null where product_site_related_code = ''`,
    `update product_details set product_site_nutrition = null where product_site_nutrition = ''`,
    `update product_details set product_site_discount_value = null where product_site_discount_value = ''`,

    `update product_details set product_site_discount_type = null where product_site_discount_type = ''`,
  ]

  for (const k in lista11) {
    // miniQuery(lista11[k])
  }
  var sql = `select distinct *, product_details.id as ID_NOVA from products inner join product_details where products.product_affiliate_id = product_details.product_affiliate_id and products.product_code = product_details.product_code  and products.product_affiliate_id = ${body.affiliate_id} and product_details.id >  ${body.lastID} limit ${body.totalItems}`

  console.log(sql)
  conn.query(sql, async function (error, results, fields) {
    if (!error) {
      var newList = []
      console.log('total items da busca inicial=> ' + results.length)
      for (const k in results) {
        const folder =
          './public/images/' + body.affiliate_id + '/' + results[k].product_code
        const folderExport =
          'images/' + body.affiliate_id + '/' + results[k].product_code
        console.log(folder)
        var listaImgens = [],
          texto = ''
        // if (!fs.existsSync(folder)){

        //  }else{

        try {
          if (!fs.exists(folder)) {
            console.log('folder')
            console.log(folder)
            fs.readdir(folder, (err, files) => {
              console.log(results[k].product_code + ' com a pasta..')
              console.log('files')
              console.log(files)
              var listNames = []
              if (files != undefined) {
                files.forEach((file) => {
                  listNames.push(folderExport + '/' + file)
                })
              }

              texto = JSON.stringify(listNames)
              newList.push({
                id: results[k].ID_NOVA,
                product_affiliate_id: results[k].product_affiliate_id,
                product_code: results[k].product_code,
                product_status: results[k].product_status,
                product_site_name: results[k].product_site_name,
                product_site_estoque: results[k].product_site_estoque,
                product_site_ean: results[k].product_site_ean,
                product_site_fabricacao: results[k].product_site_fabricacao,
                product_site_description: results[k].product_site_description,
                product_site_categories: results[k].product_site_categories,
                product_site_tags: results[k].product_site_tags,
                product_site_variations: results[k].product_site_variations,
                product_site_info: results[k].product_site_info,
                product_site_nutrition: results[k].product_site_nutrition,
                product_site_value: results[k].product_site_value,

                product_valor_atacado: results[k].product_valor_atacado,
                product_quantidade_atacado:
                  results[k].product_quantidade_atacado,

                product_site_discount_value:
                  results[k].product_site_discount_value,
                product_site_discount_type:
                  results[k].product_site_discount_type,
                product_sell_by_weight: results[k].product_sell_by_weight,
                product_average_weight_value:
                  results[k].product_average_weight_value,
                product_average_weight_type:
                  results[k].product_average_weight_type,
                product_site_related_title:
                  results[k].product_site_related_title,
                product_site_related_type: results[k].product_site_related_type,
                product_site_related_code: results[k].product_site_related_code,
                product_ean: results[k].product_ean,
                product_descricao: results[k].product_descricao,
                product_valor: results[k].product_valor,
                product_categoria: results[k].product_categoria,
                product_fabricacao: results[k].product_fabricacao,
                product_estoque: results[k].product_estoque,
                product_medida: results[k].product_medida,
                product_etiquetas: results[k].product_etiquetas,
                product_thumbnail: results[k].product_thumbnail,
                uploadImages: texto,
              })
            })
          } else {
            console.log(results[k].product_code + ' sem a pasta..')
            texto = '[]'
            newList.push({
              id: results[k].ID_NOVA,
              product_affiliate_id: results[k].product_affiliate_id,
              product_code: results[k].product_code,
              product_status: results[k].product_status,
              product_site_name: results[k].product_site_name,
              product_site_estoque: results[k].product_site_estoque,
              product_site_ean: results[k].product_site_ean,
              product_site_fabricacao: results[k].product_site_fabricacao,
              product_site_description: results[k].product_site_description,
              product_site_categories: results[k].product_site_categories,
              product_site_tags: results[k].product_site_tags,
              product_site_variations: results[k].product_site_variations,
              product_site_info: results[k].product_site_info,
              product_site_nutrition: results[k].product_site_nutrition,
              product_site_value: results[k].product_site_value,
              product_site_discount_value:
                results[k].product_site_discount_value,
              product_site_discount_type: results[k].product_site_discount_type,
              product_sell_by_weight: results[k].product_sell_by_weight,
              product_average_weight_value:
                results[k].product_average_weight_value,
              product_average_weight_type:
                results[k].product_average_weight_type,

              product_valor_atacado: results[k].product_valor_atacado,
              product_quantidade_atacado: results[k].product_quantidade_atacado,

              product_site_related_title: results[k].product_site_related_title,
              product_site_related_type: results[k].product_site_related_type,
              product_site_related_code: results[k].product_site_related_code,
              product_ean: results[k].product_ean,
              product_descricao: results[k].product_descricao,
              product_valor: results[k].product_valor,
              product_categoria: results[k].product_categoria,
              product_fabricacao: results[k].product_fabricacao,
              product_estoque: results[k].product_estoque,
              product_medida: results[k].product_medida,
              product_etiquetas: results[k].product_etiquetas,
              product_thumbnail: results[k].product_thumbnail,
              uploadImages: texto,
            })
          }
        } catch (erru) {
          //console.log(erru);
          console.log(results[k].product_code + ' sem a pasta..')
          texto = '[]'
          newList.push({
            id: results[k].ID_NOVA,
            product_affiliate_id: results[k].product_affiliate_id,
            product_code: results[k].product_code,
            product_status: results[k].product_status,
            product_site_name: results[k].product_site_name,
            product_site_estoque: results[k].product_site_estoque,
            product_site_ean: results[k].product_site_ean,
            product_site_fabricacao: results[k].product_site_fabricacao,
            product_site_description: results[k].product_site_description,
            product_site_categories: results[k].product_site_categories,
            product_site_tags: results[k].product_site_tags,
            product_site_variations: results[k].product_site_variations,
            product_site_info: results[k].product_site_info,
            product_site_nutrition: results[k].product_site_nutrition,
            product_site_value: results[k].product_site_value,
            product_site_discount_value: results[k].product_site_discount_value,
            product_site_discount_type: results[k].product_site_discount_type,
            product_sell_by_weight: results[k].product_sell_by_weight,
            product_average_weight_value:
              results[k].product_average_weight_value,

            product_valor_atacado: results[k].product_valor_atacado,
            product_quantidade_atacado: results[k].product_quantidade_atacado,

            product_average_weight_type: results[k].product_average_weight_type,
            product_site_related_title: results[k].product_site_related_title,
            product_site_related_type: results[k].product_site_related_type,
            product_site_related_code: results[k].product_site_related_code,
            product_ean: results[k].product_ean,
            product_descricao: results[k].product_descricao,
            product_valor: results[k].product_valor,
            product_categoria: results[k].product_categoria,
            product_fabricacao: results[k].product_fabricacao,
            product_estoque: results[k].product_estoque,
            product_medida: results[k].product_medida,
            product_etiquetas: results[k].product_etiquetas,
            product_thumbnail: results[k].product_thumbnail,
            uploadImages: texto,
          })
        }

        //}
      }
      console.log('total items => ' + newList.length)
      res.send(newList)
    } else {
      console.log(error)
      res.send(error)
    }
  })
}

module.exports.productsActive = function (body, res) {
  var sql =
    'select distinct *, products.id as ID_NOVA from products inner join product_details where products.product_affiliate_id = product_details.product_affiliate_id ' +
    'and products.product_ean = product_details.product_site_ean  and products.product_affiliate_id = ' +
    body.affiliate_id +
    '  and product_details.product_status = "active" and products.product_estoque > 0 limit ' +
    body.lastID +
    ',' +
    body.totalItems

  console.log(sql)
  conn.query(sql, async function (error, results, fields) {
    if (!error) {
      var newList = []
      console.log('total items da busca ativos inicial=> ' + results.length)
      for (const k in results) {
        const folder =
          './public/images/' + body.affiliate_id + '/' + results[k].product_code
        const folderExport =
          'images/' + body.affiliate_id + '/' + results[k].product_code
        console.log(folder)
        var listaImgens = [],
          texto = ''
        // if (!fs.existsSync(folder)){

        //  }else{

        try {
          if (!fs.exists(folder)) {
            console.log('folder')
            console.log(folder)
            fs.readdir(folder, (err, files) => {
              console.log(results[k].product_code + ' com a pasta..')
              console.log('files')
              console.log(files)
              var listNames = []
              if (files != undefined) {
                files.forEach((file) => {
                  listNames.push(folderExport + '/' + file)
                })
              }

              texto = JSON.stringify(listNames)
              newList.push({
                id: results[k].id,
                product_affiliate_id: results[k].product_affiliate_id,
                product_code: results[k].product_code,
                product_status: results[k].product_status,
                product_site_name: results[k].product_site_name,
                product_site_estoque: results[k].product_site_estoque,
                product_site_ean: results[k].product_site_ean,
                product_site_fabricacao: results[k].product_site_fabricacao,
                product_site_description: results[k].product_site_description,
                product_site_categories: results[k].product_site_categories,
                product_site_tags: results[k].product_site_tags,
                product_site_variations: results[k].product_site_variations,
                product_site_info: results[k].product_site_info,
                product_site_nutrition: results[k].product_site_nutrition,
                product_site_value: results[k].product_site_value,
                product_site_discount_value:
                  results[k].product_site_discount_value,
                product_site_discount_type:
                  results[k].product_site_discount_type,
                product_sell_by_weight: results[k].product_sell_by_weight,
                product_average_weight_value:
                  results[k].product_average_weight_value,
                product_average_weight_type:
                  results[k].product_average_weight_type,
                product_site_related_title:
                  results[k].product_site_related_title,
                product_site_related_type: results[k].product_site_related_type,
                product_site_related_code: results[k].product_site_related_code,
                product_ean: results[k].product_ean,
                product_descricao: results[k].product_descricao,
                product_valor: results[k].product_valor,
                product_categoria: results[k].product_categoria,
                product_fabricacao: results[k].product_fabricacao,
                product_estoque: results[k].product_estoque,
                product_medida: results[k].product_medida,
                product_etiquetas: results[k].product_etiquetas,
                product_thumbnail: results[k].product_thumbnail,

                product_valor_atacado: results[k].product_valor_atacado,
                product_quantidade_atacado:
                  results[k].product_quantidade_atacado,

                uploadImages: texto,
              })
            })
          } else {
            console.log(results[k].product_code + ' sem a pasta..')
            texto = '[]'
            newList.push({
              id: results[k].id,
              product_affiliate_id: results[k].product_affiliate_id,
              product_code: results[k].product_code,
              product_status: results[k].product_status,
              product_site_name: results[k].product_site_name,
              product_site_estoque: results[k].product_site_estoque,
              product_site_ean: results[k].product_site_ean,
              product_site_fabricacao: results[k].product_site_fabricacao,
              product_site_description: results[k].product_site_description,
              product_site_categories: results[k].product_site_categories,
              product_site_tags: results[k].product_site_tags,
              product_site_variations: results[k].product_site_variations,
              product_site_info: results[k].product_site_info,
              product_site_nutrition: results[k].product_site_nutrition,
              product_site_value: results[k].product_site_value,
              product_site_discount_value:
                results[k].product_site_discount_value,
              product_site_discount_type: results[k].product_site_discount_type,
              product_sell_by_weight: results[k].product_sell_by_weight,
              product_average_weight_value:
                results[k].product_average_weight_value,
              product_average_weight_type:
                results[k].product_average_weight_type,
              product_site_related_title: results[k].product_site_related_title,
              product_site_related_type: results[k].product_site_related_type,
              product_site_related_code: results[k].product_site_related_code,
              product_ean: results[k].product_ean,
              product_descricao: results[k].product_descricao,
              product_valor: results[k].product_valor,
              product_categoria: results[k].product_categoria,
              product_fabricacao: results[k].product_fabricacao,
              product_estoque: results[k].product_estoque,
              product_medida: results[k].product_medida,
              product_etiquetas: results[k].product_etiquetas,
              product_thumbnail: results[k].product_thumbnail,

              product_valor_atacado: results[k].product_valor_atacado,
              product_quantidade_atacado: results[k].product_quantidade_atacado,

              uploadImages: texto,
            })
          }
        } catch (erru) {
          // console.log(erru);
          console.log(results[k].product_code + ' sem a pasta..')
          texto = '[]'
          newList.push({
            id: results[k].id,
            product_affiliate_id: results[k].product_affiliate_id,
            product_code: results[k].product_code,
            product_status: results[k].product_status,
            product_site_name: results[k].product_site_name,
            product_site_estoque: results[k].product_site_estoque,
            product_site_ean: results[k].product_site_ean,
            product_site_fabricacao: results[k].product_site_fabricacao,
            product_site_description: results[k].product_site_description,
            product_site_categories: results[k].product_site_categories,
            product_site_tags: results[k].product_site_tags,
            product_site_variations: results[k].product_site_variations,
            product_site_info: results[k].product_site_info,
            product_site_nutrition: results[k].product_site_nutrition,
            product_site_value: results[k].product_site_value,
            product_site_discount_value: results[k].product_site_discount_value,
            product_site_discount_type: results[k].product_site_discount_type,
            product_sell_by_weight: results[k].product_sell_by_weight,
            product_average_weight_value:
              results[k].product_average_weight_value,
            product_average_weight_type: results[k].product_average_weight_type,
            product_site_related_title: results[k].product_site_related_title,
            product_site_related_type: results[k].product_site_related_type,
            product_site_related_code: results[k].product_site_related_code,
            product_ean: results[k].product_ean,
            product_descricao: results[k].product_descricao,
            product_valor: results[k].product_valor,
            product_categoria: results[k].product_categoria,
            product_fabricacao: results[k].product_fabricacao,
            product_estoque: results[k].product_estoque,
            product_medida: results[k].product_medida,
            product_etiquetas: results[k].product_etiquetas,
            product_thumbnail: results[k].product_thumbnail,

            product_valor_atacado: results[k].product_valor_atacado,
            product_quantidade_atacado: results[k].product_quantidade_atacado,

            uploadImages: texto,
          })
        }

        //}
      }
      console.log('total items => ' + newList.length)
      res.send(newList)
    } else {
      console.log(error)
      res.send(error)
    }
  })
}

module.exports.productSearch = function (body, res) {
  //console.log(body);
  if (body.product_code != undefined && body.product_site_name) {
    var word1 = body.product_code.split(' ')
    var word2 = body.product_site_name.split(' ')

    //
    //
    var conditions =
      'products.product_affiliate_id = product_details.product_affiliate_id ' +
      'and products.product_code = product_details.product_code  and products.product_affiliate_id = ' +
      body.product_affiliate_id

    // var superBusca = '';

    // for (const k in word1) {
    //   superBusca +=
    //     'product_details.product_site_tags like "%' +
    //     word1[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or product_details.product_site_name like "%' +
    //     word1[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or  product_details.product_code like "%' +
    //     word1[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or  products.product_ean like "%' +
    //     word1[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or ';
    // }
    // for (const k in word2) {
    //   superBusca +=
    //     'product_details.product_site_tags like "%' +
    //     word1[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or product_details.product_site_name like "%' +
    //     word2[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or  product_details.product_code like "%' +
    //     word2[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or  products.product_ean like "%' +
    //     word2[k] +
    //     '%" and ' +
    //     conditions +
    //     ' or ';
    // }

    var superBusca = ''
    let options = [
      'product_details.product_site_tags',
      'product_details.product_site_name',
      'product_details.product_code',
      'products.product_ean',
      'products.product_categoria',
    ]

    for (const a in options) {
      for (const k in word1) {
        if (options[a] == 'product_details.product_site_name') {
          if (word1[k] != '') {
            superBusca +=
              ' MATCH(' + options[a] + ')  AGAINST ("' + word1[k] + '") and '
          }
        } else {
          if (word1[k] != '') {
            superBusca += options[a] + ' like "%' + word1[k] + '%" and '
          }
        }
      }
      superBusca += conditions + ' or '
    }

    for (const a in options) {
      for (const k in word2) {
        if (options[a] == 'product_details.product_site_name') {
          if (word2[k] != '') {
            superBusca +=
              ' MATCH(' + options[a] + ')  AGAINST ("' + word2[k] + '") and '
          }
        } else {
          if (word2[k] != '') {
            superBusca += options[a] + ' like "%' + word2[k] + '%" and '
          }
        }
      }
      superBusca += conditions + ' or '
    }

    for (const k in word2) {
      superBusca +=
        'product_details.product_site_name' + ' like "%' + word2[k] + '%" and '
    }

    for (const k in word1) {
      superBusca +=
        'product_details.product_site_name' + ' like "%' + word1[k] + '%" and '
    }

    superBusca += conditions + ' or '

    var sql =
      'select distinct *, products.id as ID_NOVA from products inner join product_details where ' +
      superBusca +
      ' limit ' +
      body.lastID +
      ',' +
      body.totalItems
    sql = sql.replace('or  limit', 'limit')
    sql = sql.replace('and  limit', 'limit')
    console.log('consutei ... ', sql)
    execSQL(sql, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.productSearchSite = function (body, res) {
  console.log('productSearchSite', body)
  if (body.product_code != undefined && body.product_site_name) {
    var word1 = body.product_code.split(' ')
    var word2 = body.product_site_name.split(' ')

    //
    //
    var conditions =
      'products.product_affiliate_id = product_details.product_affiliate_id and product_details.product_status = "active" ' +
      'and products.product_code = product_details.product_code  and products.product_affiliate_id = ' +
      body.product_affiliate_id +
      ' and product_details.id > ' +
      body.lastID +
      ''

    var superBusca = ''
    let options = [
      'product_details.product_site_tags',
      'product_details.product_site_name',
      'product_details.product_code',
      'products.product_ean',
      'products.product_categoria',
    ]

    for (const a in options) {
      for (const k in word1) {
        if (options[a] == 'product_details.product_site_name') {
          if (word1[k] != '') {
            superBusca +=
              ' MATCH(' + options[a] + ')  AGAINST ("' + word1[k] + '") and '
          }
        } else {
          if (word1[k] != '') {
            superBusca += options[a] + ' like "%' + word1[k] + '%" and '
          }
        }
      }
      superBusca += conditions + ' or '
    }

    for (const a in options) {
      for (const k in word2) {
        if (options[a] == 'product_details.product_site_name') {
          if (word2[k] != '') {
            superBusca +=
              ' MATCH(' + options[a] + ')  AGAINST ("' + word2[k] + '") and '
          }
        } else {
          if (word2[k] != '') {
            superBusca += options[a] + ' like "%' + word2[k] + '%" and '
          }
        }
      }
      superBusca += conditions + ' or '
    }
    var sql =
      'select distinct *, products.id as ID_NOVA from products inner join product_details where ' +
      superBusca +
      ' limit ' +
      body.totalItems
    sql = sql.replace('or  limit', 'limit')
    console.log('consutei ... ', sql)
    execSQL(sql, res)
  } else {
    console.log('----------------------------ERRRO')
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

function mountParameters(parametros) {
  let innerSql = '',
    conditions = ''
  for (const k in parametros) {
    switch (parametros[k].colmun) {
      case 'categorias':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_site_categories like "%' +
            parametros[k].value +
            '%" '
        }
        break
      case 'descricao':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_site_name like "%' +
            parametros[k].value +
            '%" '
        }
        break

      case 'marcas':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_site_fabricacao = "' +
            parametros[k].value +
            '" '
        }
        break

      case 'tags':
        if (parametros[k].active === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_site_tags = "' +
            parametros[k].value +
            '"  '
        }
        break

      case 'desativados':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_status != "' +
            parametros[k].value +
            '"  '
        }
        break

      case 'estoque_baixo':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_site_estoque < "' +
            parametros[k].value +
            '"  '
        }
        break

      case 'promocao':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_site_discount_value != "' +
            parametros[k].value +
            '"  '
        }
        break

      case 'variacao':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_site_variations = "' +
            parametros[k].value +
            '"  '
        }
        break

      case 'peso_unidade':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and product_details.product_sell_by_weight = "' +
            parametros[k].value +
            '"  '
        }
        break

      case 'imagen':
        if (parametros[k].active.toString() === 'true') {
          innerSql +=
            ' ' +
            conditions +
            ' and products.product_thumbnail != "' +
            parametros[k].value +
            '"  '
        }
        break

      default:
        break
    }
  }
  innerSql += '&'
  innerSql = innerSql.replace('and&', '').replace('&', '')
  return innerSql
}

module.exports.productAdvancedSearch = function (body, res) {
  console.log('search advanced   ...', body)
  if (
    body.parameters != undefined &&
    body.affiliate_id != undefined &&
    body.lastId != undefined
  ) {
    if (body.explain == 'true') {
      var parametros = body.parameters
      var sqlFull =
        'select count(products.id) as "rows" from products inner join product_details '
      var innerSql = ''
      var conditions =
        ' products.product_affiliate_id = product_details.product_affiliate_id ' +
        'and products.product_code = product_details.product_code and product_details.id > ' +
        body.lastId +
        '  and products.product_affiliate_id = ' +
        body.affiliate_id
      for (const k in parametros) {
        switch (parametros[k].colmun) {
          case 'categorias':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_categories like "%' +
                parametros[k].value +
                '%" and'
            }
            break
          case 'descricao':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_name like "%' +
                parametros[k].value +
                '%" and'
            }
            break

          case 'marcas':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_fabricacao = "' +
                parametros[k].value +
                '" and'
            }
            break

          case 'tags':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_tags = "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'desativados':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_status != "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'estoque_baixo':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_estoque < "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'promocao':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_discount_value != "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'variacao':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_variations = "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'peso_unidade':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_sell_by_weight = "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'imagen':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and products.product_thumbnail != "' +
                parametros[k].value +
                '"  and'
            }
            break

          default:
            break
        }
      }
      var limiteBusca = body.limite
      if (limiteBusca == undefined) {
        limiteBusca = 10000
      }

      sqlFull += ' where ' + innerSql + ' limit ' + limiteBusca
      sqlFull = sqlFull.replace('and limit', 'limit')
      sqlFull = sqlFull.replace('where  and', ' where ')
      console.log('sqlFULLL', sqlFull)
      conn.query(sqlFull, async function (error, results, fields) {
        if (!error) {
          res.send(results)
        } else {
          console.log(error)
          res.send(error)
        }
      })
    } else {
      var parametros = body.parameters
      var sqlFull =
        'select distinct *, products.id as ID_NOVA from products inner join product_details '
      var innerSql = ''
      var conditions =
        ' products.product_affiliate_id = product_details.product_affiliate_id ' +
        'and products.product_code = product_details.product_code and product_details.id > ' +
        body.lastId +
        '  and products.product_affiliate_id = ' +
        body.affiliate_id
      for (const k in parametros) {
        switch (parametros[k].colmun) {
          case 'categorias':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_categories like "%' +
                parametros[k].value +
                '%" and'
            }
            break
          case 'descricao':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_name like "%' +
                parametros[k].value +
                '%" and'
            }
            break

          case 'marcas':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_fabricacao = "' +
                parametros[k].value +
                '" and'
            }
            break

          case 'tags':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_tags = "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'desativados':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_status != "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'estoque_baixo':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_estoque < "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'promocao':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_discount_value != "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'variacao':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_site_variations = "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'peso_unidade':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and product_details.product_sell_by_weight = "' +
                parametros[k].value +
                '"  and'
            }
            break

          case 'imagen':
            if (parametros[k].active === 'true') {
              innerSql +=
                ' ' +
                conditions +
                ' and products.product_thumbnail != "' +
                parametros[k].value +
                '"  and'
            }
            break

          default:
            break
        }
      }
      var limiteBusca = body.limite
      if (limiteBusca == undefined) {
        limiteBusca = 10000
      }

      let ordernament = ''
      if (body.order_type && body.column_order) {
        ordernament = ' order by ' + body.column_order + ' ' + body.order_type
      }

      sqlFull += ' where ' + innerSql + ' limit ' + limiteBusca

      sqlFull = sqlFull.replace('and limit', 'limit')
      sqlFull = sqlFull.replace('where  and', ' where ')
      console.log('sqlFULLL', sqlFull)
      conn.query(sqlFull, async function (error, results, fields) {
        if (!error) {
          var newList = []
          console.log('total items da busca inicial=> ' + results.length)
          for (const k in results) {
            const folder =
              './public/images/' +
              body.affiliate_id +
              '/' +
              results[k].product_code
            const folderExport =
              'images/' + body.affiliate_id + '/' + results[k].product_code
            console.log(folder)
            var listaImgens = [],
              texto = ''
            // if (!fs.existsSync(folder)){

            //  }else{

            try {
              if (!fs.exists(folder)) {
                console.log('folder')
                console.log(folder)
                fs.readdir(folder, (err, files) => {
                  console.log(results[k].product_code + ' com a pasta..')
                  console.log('files')
                  console.log(files)
                  var listNames = []
                  if (files != undefined) {
                    files.forEach((file) => {
                      listNames.push(folderExport + '/' + file)
                    })
                  }

                  texto = JSON.stringify(listNames)
                  newList.push({
                    id: results[k].id,
                    product_affiliate_id: results[k].product_affiliate_id,
                    product_code: results[k].product_code,
                    product_status: results[k].product_status,
                    product_site_name: results[k].product_site_name,
                    product_site_estoque: results[k].product_site_estoque,
                    product_site_ean: results[k].product_site_ean,
                    product_site_fabricacao: results[k].product_site_fabricacao,
                    product_site_description:
                      results[k].product_site_description,
                    product_site_categories: results[k].product_site_categories,
                    product_site_tags: results[k].product_site_tags,
                    product_site_variations: results[k].product_site_variations,
                    product_site_info: results[k].product_site_info,
                    product_site_nutrition: results[k].product_site_nutrition,
                    product_site_value: results[k].product_site_value,
                    product_site_discount_value:
                      results[k].product_site_discount_value,
                    product_site_discount_type:
                      results[k].product_site_discount_type,
                    product_sell_by_weight: results[k].product_sell_by_weight,
                    product_average_weight_value:
                      results[k].product_average_weight_value,
                    product_average_weight_type:
                      results[k].product_average_weight_type,
                    product_site_related_title:
                      results[k].product_site_related_title,
                    product_site_related_type:
                      results[k].product_site_related_type,
                    product_site_related_code:
                      results[k].product_site_related_code,
                    product_ean: results[k].product_ean,
                    product_descricao: results[k].product_descricao,
                    product_valor: results[k].product_valor,
                    product_categoria: results[k].product_categoria,
                    product_fabricacao: results[k].product_fabricacao,
                    product_estoque: results[k].product_estoque,
                    product_medida: results[k].product_medida,
                    product_etiquetas: results[k].product_etiquetas,
                    product_thumbnail: results[k].product_thumbnail,
                    uploadImages: texto,
                  })
                })
              } else {
                console.log(results[k].product_code + ' sem a pasta..')
                texto = '[]'
                newList.push({
                  id: results[k].id,
                  product_affiliate_id: results[k].product_affiliate_id,
                  product_code: results[k].product_code,
                  product_status: results[k].product_status,
                  product_site_name: results[k].product_site_name,
                  product_site_estoque: results[k].product_site_estoque,
                  product_site_ean: results[k].product_site_ean,
                  product_site_fabricacao: results[k].product_site_fabricacao,
                  product_site_description: results[k].product_site_description,
                  product_site_categories: results[k].product_site_categories,
                  product_site_tags: results[k].product_site_tags,
                  product_site_variations: results[k].product_site_variations,
                  product_site_info: results[k].product_site_info,
                  product_site_nutrition: results[k].product_site_nutrition,
                  product_site_value: results[k].product_site_value,
                  product_site_discount_value:
                    results[k].product_site_discount_value,
                  product_site_discount_type:
                    results[k].product_site_discount_type,
                  product_sell_by_weight: results[k].product_sell_by_weight,
                  product_average_weight_value:
                    results[k].product_average_weight_value,
                  product_average_weight_type:
                    results[k].product_average_weight_type,
                  product_site_related_title:
                    results[k].product_site_related_title,
                  product_site_related_type:
                    results[k].product_site_related_type,
                  product_site_related_code:
                    results[k].product_site_related_code,
                  product_ean: results[k].product_ean,
                  product_descricao: results[k].product_descricao,
                  product_valor: results[k].product_valor,
                  product_categoria: results[k].product_categoria,
                  product_fabricacao: results[k].product_fabricacao,
                  product_estoque: results[k].product_estoque,
                  product_medida: results[k].product_medida,
                  product_etiquetas: results[k].product_etiquetas,
                  product_thumbnail: results[k].product_thumbnail,
                  uploadImages: texto,
                })
              }
            } catch (erru) {
              console.log(erru)
              console.log(results[k].product_code + ' sem a pasta..')
              texto = '[]'
              newList.push({
                id: results[k].id,
                product_affiliate_id: results[k].product_affiliate_id,
                product_code: results[k].product_code,
                product_status: results[k].product_status,
                product_site_name: results[k].product_site_name,
                product_site_estoque: results[k].product_site_estoque,
                product_site_ean: results[k].product_site_ean,
                product_site_fabricacao: results[k].product_site_fabricacao,
                product_site_description: results[k].product_site_description,
                product_site_categories: results[k].product_site_categories,
                product_site_tags: results[k].product_site_tags,
                product_site_variations: results[k].product_site_variations,
                product_site_info: results[k].product_site_info,
                product_site_nutrition: results[k].product_site_nutrition,
                product_site_value: results[k].product_site_value,
                product_site_discount_value:
                  results[k].product_site_discount_value,
                product_site_discount_type:
                  results[k].product_site_discount_type,
                product_sell_by_weight: results[k].product_sell_by_weight,
                product_average_weight_value:
                  results[k].product_average_weight_value,
                product_average_weight_type:
                  results[k].product_average_weight_type,
                product_site_related_title:
                  results[k].product_site_related_title,
                product_site_related_type: results[k].product_site_related_type,
                product_site_related_code: results[k].product_site_related_code,
                product_ean: results[k].product_ean,
                product_descricao: results[k].product_descricao,
                product_valor: results[k].product_valor,
                product_categoria: results[k].product_categoria,
                product_fabricacao: results[k].product_fabricacao,
                product_estoque: results[k].product_estoque,
                product_medida: results[k].product_medida,
                product_etiquetas: results[k].product_etiquetas,
                product_thumbnail: results[k].product_thumbnail,
                uploadImages: texto,
              })
            }

            //}
          }
          console.log('total items => ' + newList.length)
          res.send(newList)
        } else {
          console.log(error)
          res.send(error)
        }
      })
    }
  } else {
    console.log('Invalid data parameters!')
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

// module.exports.productAdvancedSearch = function (body, res) {
//   //console.log(body);
//   if (body.parameters != undefined && body.affiliate_id != undefined && body.lastId != undefined) {
//     var parametros = body.parameters;
//     var sqlFull =
//       'select *, products.id as ID_NOVA from products inner join product_details ';
//     var innerSql = '';
//     var conditions =
//       ' products.product_affiliate_id = product_details.product_affiliate_id ' +
//       'and products.product_code = product_details.product_code and product_details.id > ' + body.lastId + '  and products.product_affiliate_id = ' +
//       body.affiliate_id;
//     for (const k in parametros) {
//       switch (parametros[k].colmun) {
//         case 'categorias':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_site_categories like "%' +
//               parametros[k].value +
//               '%" and';
//           }
//           break;
//         case 'descricao':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_site_name like "%' +
//               parametros[k].value +
//               '%" and';
//           }
//           break;

//         case 'marcas':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_site_fabricacao = "' +
//               parametros[k].value +
//               '" and';
//           }
//           break;

//         case 'tags':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_site_tags = "' +
//               parametros[k].value +
//               '"  and';
//           }
//           break;

//         case 'desativados':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_status != "' +
//               parametros[k].value +
//               '"  and';
//           }
//           break;

//         case 'estoque_baixo':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_site_estoque < "' +
//               parametros[k].value +
//               '"  and';
//           }
//           break;

//         case 'promocao':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_site_discount_value != "' +
//               parametros[k].value +
//               '"  and';
//           }
//           break;

//         case 'variacao':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_site_variations = "' +
//               parametros[k].value +
//               '"  and';
//           }
//           break;

//         case 'peso_unidade':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and product_details.product_sell_by_weight = "' +
//               parametros[k].value +
//               '"  and';
//           }
//           break;

//         case 'imagen':
//           if (parametros[k].active === 'true') {
//             innerSql +=
//               ' ' +
//               conditions +
//               ' and products.product_thumbnail != "' +
//               parametros[k].value +
//               '"  and';
//           }
//           break;

//         default:
//           break;
//       }
//     }
//     var limiteBusca = body.limite;
//     if (limiteBusca == undefined) {
//       limiteBusca = 10000;
//     }

//     sqlFull += ' where ' + innerSql + ' limit ' + limiteBusca;
//     sqlFull = sqlFull.replace('and limit', 'limit');
//     sqlFull = sqlFull.replace('where  and', ' where ');
//     conn.query(sqlFull, async function (error, results, fields) {
//       if (!error) {
//         var newList = [];
//         console.log('total items da busca inicial=> ' + results.length);
//         for (const k in results) {
//           const folder =
//             './public/images/' +
//             body.affiliate_id +
//             '/' +
//             results[k].product_code;
//           const folderExport =
//             'images/' + body.affiliate_id + '/' + results[k].product_code;
//           console.log(folder);
//           var listaImgens = [],
//             texto = '';
//           // if (!fs.existsSync(folder)){

//           //  }else{

//           try {
//             if (!fs.exists(folder)) {
//               console.log('folder');
//               console.log(folder);
//               fs.readdir(folder, (err, files) => {
//                 console.log(results[k].product_code + ' com a pasta..');
//                 console.log('files');
//                 console.log(files);
//                 var listNames = [];
//                 if (files != undefined) {
//                   files.forEach((file) => {
//                     listNames.push(folderExport + '/' + file);
//                   });
//                 }

//                 texto = JSON.stringify(listNames);
//                 newList.push({
//                   id: results[k].id,
//                   product_affiliate_id: results[k].product_affiliate_id,
//                   product_code: results[k].product_code,
//                   product_status: results[k].product_status,
//                   product_site_name: results[k].product_site_name,
//                   product_site_estoque: results[k].product_site_estoque,
//                   product_site_ean: results[k].product_site_ean,
//                   product_site_fabricacao: results[k].product_site_fabricacao,
//                   product_site_description: results[k].product_site_description,
//                   product_site_categories: results[k].product_site_categories,
//                   product_site_tags: results[k].product_site_tags,
//                   product_site_variations: results[k].product_site_variations,
//                   product_site_info: results[k].product_site_info,
//                   product_site_nutrition: results[k].product_site_nutrition,
//                   product_site_value: results[k].product_site_value,
//                   product_site_discount_value:
//                     results[k].product_site_discount_value,
//                   product_site_discount_type:
//                     results[k].product_site_discount_type,
//                   product_sell_by_weight: results[k].product_sell_by_weight,
//                   product_average_weight_value:
//                     results[k].product_average_weight_value,
//                   product_average_weight_type:
//                     results[k].product_average_weight_type,
//                   product_site_related_title:
//                     results[k].product_site_related_title,
//                   product_site_related_type:
//                     results[k].product_site_related_type,
//                   product_site_related_code:
//                     results[k].product_site_related_code,
//                   product_ean: results[k].product_ean,
//                   product_descricao: results[k].product_descricao,
//                   product_valor: results[k].product_valor,
//                   product_categoria: results[k].product_categoria,
//                   product_fabricacao: results[k].product_fabricacao,
//                   product_estoque: results[k].product_estoque,
//                   product_medida: results[k].product_medida,
//                   product_etiquetas: results[k].product_etiquetas,
//                   product_thumbnail: results[k].product_thumbnail,
//                   uploadImages: texto,
//                 });
//               });
//             } else {
//               console.log(results[k].product_code + ' sem a pasta..');
//               texto = '[]';
//               newList.push({
//                 id: results[k].id,
//                 product_affiliate_id: results[k].product_affiliate_id,
//                 product_code: results[k].product_code,
//                 product_status: results[k].product_status,
//                 product_site_name: results[k].product_site_name,
//                 product_site_estoque: results[k].product_site_estoque,
//                 product_site_ean: results[k].product_site_ean,
//                 product_site_fabricacao: results[k].product_site_fabricacao,
//                 product_site_description: results[k].product_site_description,
//                 product_site_categories: results[k].product_site_categories,
//                 product_site_tags: results[k].product_site_tags,
//                 product_site_variations: results[k].product_site_variations,
//                 product_site_info: results[k].product_site_info,
//                 product_site_nutrition: results[k].product_site_nutrition,
//                 product_site_value: results[k].product_site_value,
//                 product_site_discount_value:
//                   results[k].product_site_discount_value,
//                 product_site_discount_type:
//                   results[k].product_site_discount_type,
//                 product_sell_by_weight: results[k].product_sell_by_weight,
//                 product_average_weight_value:
//                   results[k].product_average_weight_value,
//                 product_average_weight_type:
//                   results[k].product_average_weight_type,
//                 product_site_related_title:
//                   results[k].product_site_related_title,
//                 product_site_related_type: results[k].product_site_related_type,
//                 product_site_related_code: results[k].product_site_related_code,
//                 product_ean: results[k].product_ean,
//                 product_descricao: results[k].product_descricao,
//                 product_valor: results[k].product_valor,
//                 product_categoria: results[k].product_categoria,
//                 product_fabricacao: results[k].product_fabricacao,
//                 product_estoque: results[k].product_estoque,
//                 product_medida: results[k].product_medida,
//                 product_etiquetas: results[k].product_etiquetas,
//                 product_thumbnail: results[k].product_thumbnail,
//                 uploadImages: texto,
//               });
//             }
//           } catch (erru) {
//             console.log(erru);
//             console.log(results[k].product_code + ' sem a pasta..');
//             texto = '[]';
//             newList.push({
//               id: results[k].id,
//               product_affiliate_id: results[k].product_affiliate_id,
//               product_code: results[k].product_code,
//               product_status: results[k].product_status,
//               product_site_name: results[k].product_site_name,
//               product_site_estoque: results[k].product_site_estoque,
//               product_site_ean: results[k].product_site_ean,
//               product_site_fabricacao: results[k].product_site_fabricacao,
//               product_site_description: results[k].product_site_description,
//               product_site_categories: results[k].product_site_categories,
//               product_site_tags: results[k].product_site_tags,
//               product_site_variations: results[k].product_site_variations,
//               product_site_info: results[k].product_site_info,
//               product_site_nutrition: results[k].product_site_nutrition,
//               product_site_value: results[k].product_site_value,
//               product_site_discount_value:
//                 results[k].product_site_discount_value,
//               product_site_discount_type: results[k].product_site_discount_type,
//               product_sell_by_weight: results[k].product_sell_by_weight,
//               product_average_weight_value:
//                 results[k].product_average_weight_value,
//               product_average_weight_type:
//                 results[k].product_average_weight_type,
//               product_site_related_title: results[k].product_site_related_title,
//               product_site_related_type: results[k].product_site_related_type,
//               product_site_related_code: results[k].product_site_related_code,
//               product_ean: results[k].product_ean,
//               product_descricao: results[k].product_descricao,
//               product_valor: results[k].product_valor,
//               product_categoria: results[k].product_categoria,
//               product_fabricacao: results[k].product_fabricacao,
//               product_estoque: results[k].product_estoque,
//               product_medida: results[k].product_medida,
//               product_etiquetas: results[k].product_etiquetas,
//               product_thumbnail: results[k].product_thumbnail,
//               uploadImages: texto,
//             });
//           }

//           //}
//         }
//         console.log('total items => ' + newList.length);
//         res.send(newList);
//       } else {
//         console.log(error);
//         res.send(error);
//       }
//     });
//   } else {
//     res
//       .status(500)
//       .json({ message: 'Invalid data parameters!', youtParameters: body });
//   }
// };

module.exports.productSearchCat = function (body, res) {
  //console.log(body);
  var conditions =
    'products.product_affiliate_id = product_details.product_affiliate_id ' +
    'and products.product_code = product_details.product_code  and product_details.product_status = "active"   and products.product_affiliate_id = ' +
    body.product_affiliate_id
  var sql =
    'select distinct *, products.id as ID_NOVA from products inner join product_details where MATCH(product_details.product_site_categories) AGAINST("' +
    body.product_site_name +
    '") and ' +
    conditions +
    ' or  products.product_categoria like "%' +
    body.product_code +
    '%" and ' +
    conditions +
    ' limit ' +
    body.lastID +
    ',' +
    body.totalItems
  console.log('cat search')
  console.log(sql)
  execSQL(sql, res)
}

module.exports.productSearchCat2 = function (body, res) {
  console.log(body)

  var sql =
    `select distinct *, products.id as ID_NOVA from products inner join product_details where product_details.product_site_categories like '%${body.product_site_name}%' ` +
    'and  product_details.product_status = "active" and   products.product_code = product_details.product_code and product_details.product_affiliate_id =  ' +
    body.product_affiliate_id +
    ' and  products.product_affiliate_id =  ' +
    body.product_affiliate_id +
    ' limit ' +
    body.lastID +
    ',' +
    body.totalItems
  console.log('cat search')

  console.log(sql)
  console.log(sql)

  console.log('SQL', sql)
  execSQL(sql, res)
}

module.exports.expurgeOrders = function (body, res) {
  //console.log(body);
  if (body.affiliate_id != undefined && body.purge != undefined) {
    var sql = `select *,orders.id as ORDER_ID,orders.createdAt as dataCriacao, orders.updatedAt as dataAlteracao from orders inner join users_clients where orders.order_client_id = users_clients.id and order_status = 2 and order_affiliate_id = ${body.affiliate_id}`
    if (body.pugue) {
      miniQuery(
        `update orders inner join users_client set order_status = 3 where orders.order_client_id = users_clients.id and order_status = 2 and order_affiliate_id = ${body.affiliate_id}`
      )
    }
    execSQL(sql, res)
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.productsOrderBy = function (body, res) {
  let para = ' '
  if (body.parameters) {
    para = mountParameters(body.parameters)
  }
  console.log(body)
  var sql =
    'select distinct * from products inner join product_details where products.product_affiliate_id = product_details.product_affiliate_id ' +
    'and products.product_code = product_details.product_code  and products.product_affiliate_id = ' +
    body.product_affiliate_id +
    ' ' +
    para +
    ' order by ' +
    body.column_order +
    ' ' +
    body.order_type +
    ' limit ' +
    body.lastID +
    ',' +
    body.totalItems
  console.log('buscando', sql)
  execSQL(sql, res)
}
module.exports.newProduct = function (body, res) {
  var query =
    'select max(product_code) as numero from products where product_affiliate_id = ' +
    body.affiliate_id
  var myMax = null
  if (body.affiliate_id != undefined) {
    conn.query(query, async function (error, results, fields) {
      if (!error) {
        for (const k in results) {
          myMax = Number(results[k].numero)
          conn.query(
            'insert into products (id, product_code, product_affiliate_id,product_categoria, product_ean,product_valor, product_estoque, product_medida,product_etiquetas,createdAt,updatedAt) values (null,' +
            (myMax + 1) +
            ', ' +
            body.affiliate_id +
            ', "Novo,", "0",0, 0, "UN","NOVO",now(),now())',
            async function (error2, results2, fields3) {
              if (!error2) {
                conn.query(
                  'insert into product_details (id, product_code, product_affiliate_id,product_site_categories,product_status,updatedAt) values (null, ' +
                  (myMax + 1) +
                  ', ' +
                  body.affiliate_id +
                  ', "Novo,","active",now())',
                  async function (error4, results4, fields4) {
                    if (!error4) {
                      res.send({
                        product_code_new: myMax + 1,
                        affiliate_id: body.affiliate_id,
                      })
                    } else {
                      res.send(error4)
                    }
                  }
                )
              } else {
                res.send(error2)
              }
            }
          )
        }
      } else {
        res.send(error)
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.productsSyncByMasterId = function (body, res) {
  var sql =
    'insert into product_details (product_affiliate_id,product_code,product_site_name,product_site_categories,product_site_value) ' +
    'select product_affiliate_id,product_code,product_descricao,product_etiquetas,product_valor from products ' +
    'where products.product_affiliate_id = ' +
    body.affiliate_id +
    ' and products.product_code not in (select product_code from product_details where product_affiliate_id =' +
    body.affiliate_id +
    ')'

  // product_affiliate_id,
  // product_code,
  // product_site_name,
  // product_site_categories,
  // product_site_estoque,
  // product_site_ean,
  // product_site_fabricacao,
  // product_site_value
  // ) product_sell_by_weight = '{"compraPorPeso":false,"mostrarPeso":false}'
  // select
  // product_affiliate_id,
  // product_code,
  // product_descricao,
  // product_etiquetas,
  // product_estoque,
  // product_ean,
  // product_fabricacao,
  // product_valor

  execSQL(sql, res)
}

module.exports.countByCategoryName = function (body, res) {
  if (body.categoryName != undefined && body.affiliateId != undefined) {
    var sql =
      'select count(*) as total from products where product_categoria = "' +
      body.categoryName +
      '" and product_affiliate_id = ' +
      body.affiliateId
    execSQL(sql, res)
  } else {
    res.status(409).json({ 'erro de parametros': body })
  }
}

module.exports.getContentPage = function (body, res) {
  if (body.master_id != undefined && body.name_page != undefined) {
    var sql =
      "select * from institucional_pages where name_page = '" +
      body.name_page +
      "' and master_id = " +
      body.master_id +
      " or titulo_page = '" +
      body.name_page +
      "' and master_id = " +
      body.master_id
    conn.query(sql, async function (error2, results, fields) {
      if (!error2) {
        var dir = './public/institucional_pages/' + body.master_id
        if (!fs.existsSync('./public/institucional_pages')) {
          await fs.mkdirSync('./public/institucional_pages')
        }
        if (!fs.existsSync(dir)) {
          await fs.mkdirSync(dir)
        }

        for (const k in results) {
          let path = dir + '/' + results[k].name_page + '.html'
          try {
            // if (!fs.existsSync(path)) {

            // }
            fs.writeFileSync(path, results[k].content_page)
            console.log('feito => ', path)
          } catch (err) {
            console.log(err)
          }
        }
        res.status(200).json(results)
      } else {
        res.status(409).json({ 'erro interno de sql': error2 })
      }
    })
  } else {
    res.status(409).json({ 'erro interno de contexto': body })
  }
}

module.exports.setContentPage = function (body, res) {
  //console.log(body)
  if (
    body.master_id != undefined &&
    body.name_page != undefined &&
    body.content_page != undefined
  ) {
    let stats = 0
    if (body.status == 1) {
      stats = 1
    }
    if (body.new == 'true') {
      var sql = `insert into institucional_pages values(null, ${body.master_id},'${body.name_page}','${body.titulo_page}','${body.content_page}', '',1,${stats},now(),now())`
      execSQL(sql, res)
    } else {
      var sql = `update institucional_pages set content_page = '${body.content_page}',status = ${stats}, titulo_page = '${body.titulo_page}' where name_page = '${body.name_page}' and  master_id = ${body.master_id}`
      execSQL(sql, res)
    }
  } else {
    res.status(409).json({ 'erro interno de contexto': body })
  }
}

module.exports.getHomePage = function (body, res) {
  if (body.master_id != undefined) {
    var sql = 'select * from home_pages where  master_id = ' + body.master_id
    execSQL(sql, res)
  } else {
    res.status(409).json({ 'erro interno de contexto': body })
  }
}

module.exports.totalProducts = function (body, res) {
  execSQL(
    'select count(*) as total from products where product_affiliate_id = ' +
    body.affiliate_id,
    res
  )
}

module.exports.definePicture = function (body, res) {
  if (
    body.product_thumbnail != null &&
    body.product_thumbnail != undefined &&
    body.product_affiliate_id != null &&
    body.product_affiliate_id != undefined &&
    Number(body.product_affiliate_id) &&
    body.product_code != null &&
    body.product_code != undefined &&
    Number(body.product_code)
  ) {
    execSQL(
      "update products set product_thumbnail = '" +
      body.product_thumbnail +
      "' where product_affiliate_id = " +
      body.product_affiliate_id +
      ' and product_code = ' +
      body.product_code,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.getProductsFromOrder = function (body, res) {
  if (body.listaProdutos.length > 0 && body.product_affiliate_id != undefined) {
    var conditions =
      'products.product_affiliate_id = product_details.product_affiliate_id ' +
      'and products.product_code = product_details.product_code  and products.product_affiliate_id = ' +
      body.product_affiliate_id +
      ' '
    var lista2 = body.listaProdutos,
      produtos = ''
    for (const k in lista2) {
      produtos +=
        conditions +
        ' and products.product_code = ' +
        lista2[k].product_code +
        ' or '
    }

    var sql =
      'select distinct *  from products inner join product_details where  ' +
      produtos +
      'order by products.product_code ASC'
    sql = sql.replace('or order', 'order')
    console.log('mostrando sql')
    console.log(sql)
    conn.query(sql, async function (error2, results, fields) {
      if (!error2) {
        var listaFinal = []
        for (const k in results) {
          var cara = null,
            anota = null,
            quantidade = 0
          for (const u in lista2) {
            if (lista2[u].product_code == results[k].product_code) {
              ; (cara = lista2[u].caracteristica),
                (anota = lista2[u].anotacao),
                (quantidade = lista2[u].quantidade)
            }
          }
          listaFinal.push({
            quantidade: quantidade,
            caracteristica: cara,
            anotacao: anota,
            product_affiliate_id: results[k].product_affiliate_id,
            product_code: results[k].product_code,
            product_ean: results[k].product_ean,
            product_descricao: results[k].product_descricao,
            product_valor: results[k].product_valor,
            product_categoria: results[k].product_categoria,
            product_fabricacao: results[k].product_fabricacao,
            product_estoque: results[k].product_estoque,
            product_medida: results[k].product_medida,
            product_etiquetas: results[k].product_etiquetas,
            product_thumbnail: results[k].product_thumbnail,
            product_status: results[k].product_status,
            product_site_name: results[k].product_site_name,
            product_site_estoque: results[k].product_site_estoque,
            product_site_ean: results[k].product_site_ean,
            product_site_fabricacao: results[k].product_site_fabricacao,
            product_site_description: results[k].product_site_description,
            product_site_categories: results[k].product_site_categories,
            product_site_tags: results[k].product_site_tags,
            product_site_variations: results[k].product_site_variations,
            product_site_info: results[k].product_site_info,
            product_site_nutrition: results[k].product_site_nutrition,
            product_site_value: results[k].product_site_value,
            product_site_discount_value: results[k].product_site_discount_value,
            product_site_discount_type: results[k].product_site_discount_type,
            product_sell_by_weight: results[k].product_sell_by_weight,
            product_average_weight_value:
              results[k].product_average_weight_value,
            product_average_weight_type: results[k].product_average_weight_type,
            product_site_related_title: results[k].product_site_related_title,
            product_site_related_type: results[k].product_site_related_type,
            product_site_related_code: results[k].product_site_related_code,
          })
        }

        res.send(listaFinal)
      } else {
        res.send(error2)
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', youtParameters: body })
  }
}

module.exports.productPictures = function (body, res) {
  //console.log(body);

  if (
    body.affiliate_id != null &&
    body.affiliate_id != undefined &&
    body.product_code != null &&
    body.product_code != undefined &&
    body.product_code != '' &&
    body.affiliate_id != ''
  ) {
    const folder =
      './public/images/' + body.affiliate_id + '/' + body.product_code
    console.log(folder)

    if (!fs.existsSync(folder)) {
      res.send({ message: 'Invalid data parameters!', yourData: body })
    } else {
      fs.readdir(folder, (err, files) => {
        var listNames = []
        files.forEach((file) => {
          listNames.push(file)
        })
        res.send(listNames)
      })
    }
  } else {
    res.send({ message: 'Invalid data parameters!', yourData: body })
  }
}

module.exports.getMyPicture = function (body, res) {
  //console.log(body);
  if (
    (body.EAN != undefined && body.method == 'GET') ||
    (body.EAN != undefined && body.method == 'POST')
  ) {
    res.send({ thumbnail: process.env.site_image_host + body.EAN + '.png' })
  } else {
    res.status(500).json({ message: 'Erro in parametters', yourData: body })
  }
}

module.exports.orders = function (err, res) {
  orders.findAll().then((data) => {
    if (!err) {
      res.send(data)
    }
  })
}

module.exports.listas_compras = function (err, res) {
  listas_compras.findAll().then((data) => {
    if (!err) {
      res.send(data)
    }
  })
}
//***** */ Fim dos modelos findAll ****

//==========================================================================================================

// Devolve a identificação do usuário logado, exigindo por parâmetro o 'token_me': e-mail do usuário criptografado com sha1
/*
    As informações retornadas são:
        1- Tipo de usuário.
        2- ID de usuário.
        3- ID de afiliado e de matriz ( se houver )
        4- Nome de usuário.
        5- E-mail do usuário.
*/
module.exports.me = function (body, res) {
  var query1 =
    "select 'CLIENT' as USER_PROFILE, users_clients.id as USER_ID, users_client_affiliate_id as USER_AFFILIATE_ID, users_client_name as USER_NAME, users_client_mail as USER_MAIL  from users_clients inner join users_affiliates where sha1(concat(users_clients.id,users_client_mail)) = '" +
    body.token_me +
    "'"
  var query2 =
    "select 'AFFILIATE' as USER_PROFILE, users_affiliates.id as USER_ID,users_affiliate_master_id as USER_MASTER_ID, users_affiliate_name as USER_NAME, users_affiliate_mail as USER_MAIL  from users_affiliates  inner join users_masters where sha1(concat(users_affiliates.id,users_affiliate_mail)) = '" +
    body.token_me +
    "'"
  var query3 =
    "select 'MASTER' as USER_PROFILE, id as USER_ID, users_master_name as USER_NAME, users_master_mail as USER_MAIL , master_id as MASTER_ID from users_masters where sha1(concat(users_masters.id,users_master_mail)) = '" +
    body.token_me +
    "'"

  conn.query(query1, async function (error, results, fields) {
    if (!error) {
      if (results.length > 0) {
        res.send(results)
      } else {
        conn.query(query2, async function (error2, results2, fields2) {
          if (!error2) {
            if (results2.length > 0) {
              res.send(results2)
            } else {
              conn.query(query3, async function (error3, results3, fields3) {
                if (!error3) {
                  if (results3.length > 0) {
                    res.send(results3)
                  } else {
                    res.status(404).json({ message: 'User not found!' })
                  }
                } else {
                  res.send(error3)
                }
              })
            }
          } else {
            res.send(error2)
          }
        })
      }
    } else {
      res.send(error)
    }
  })
}

module.exports.meToo = function (body, res) {
  var query1 =
    "select master_id,affiliate_id  from users_affiliates   inner join users_masters where  sha1(concat(users_masters.id,users_master_mail)) = '" +
    body.token_me +
    "' or  sha1(concat(users_affiliates.id,users_affiliate_mail)) = '" +
    body.token_me +
    "' group by master_id,affiliate_id"
  conn.query(query1, async function (error, results, fields) {
    if (!error) {
      if (results.length > 0) {
        res.send(results)
      } else {
        res.send('no registers found')
      }
    } else {
      res.send(error)
    }
  })
}

//==========================================================================================================

// Realiza o login se valendo da 'SECRET_KEY' do JWT com tempo de expiração definido em 'TIME_TO_EXPIRE_SESSION' das váriáveis de ambiente.
/*
    Os pré-requisitos para funcionamento:
        1- 'prefix' => prefixo da tabela baseado no tipo de usuário. Ex.: 'affiliate','master' ou 'client'
        2- 'token' => password enviado pelo cliente para ser criptografado e salvo com sha1.
        3- 'user' => nome do usuário.
        4- 'table' => nome da tabela a ser modificada ( definida com base no tipo do usuário ).

        
*/

module.exports.loginCode = function (body, res) {
  //console.log(body);
  try {
    var qry =
      "select  * , sha1(concat(users_affiliates.id,users_affiliate_mail)) as token_me from users_affiliates inner join startupandrecover where users_affiliate_name = '" +
      body.mail +
      "' and startupandrecover.mail = sha1('" +
      body.mail +
      "')  and startupandrecover.verifyCode = " +
      body.code

    console.log(qry)

    conn.query(qry, function (error, results, fields) {
      if (results.length > 0) {
        //auth ok
        const id = results[0].id //esse id viria do banco de dados
        const token = jwt.sign({ id }, process.env.MAIN_SECRET, {
          expiresIn: Number(process.env.TIME_TO_EXPIRE_SESSION), // minutes to expire
        })
        return res.json({
          auth: true,
          token: token,
          data: results[0],
          token_me: results[0].token_me,
        })
      } else {
        res.status(500).json({ message: 'Login inválido!' })
      }
      if (error) {
        console.log(error)
      }
    })
  } catch (er) {
    console.log(er)
    res.status(500).json({ message: 'Login inválido!' })
  }
}

module.exports.loginCodeClient = function (body, res) {
  //console.log(body);
  try {
    var qry =
      "select  * , sha1(concat(users_clients.id,users_client_mail)) as token_me from users_clients inner join startupandrecover where users_client_mail = '" +
      body.mail +
      "' and startupandrecover.mail = sha1('" +
      body.mail +
      "')  and startupandrecover.verifyCode = " +
      body.code

    console.log(qry)

    conn.query(qry, function (error, results, fields) {
      if (results.length > 0) {
        //auth ok
        const id = results[0].id //esse id viria do banco de dados
        const token = jwt.sign({ id }, process.env.MAIN_SECRET, {
          expiresIn: Number(process.env.TIME_TO_EXPIRE_SESSION), // minutes to expire
        })
        return res.json({
          auth: true,
          token: token,
          data: results[0],
          token_me: results[0].token_me,
        })
      } else {
        res.status(500).json({ message: 'Login inválido!' })
      }
      if (error) {
        console.log(error)
      }
    })
  } catch (er) {
    console.log(er)
    res.status(500).json({ message: 'Login inválido!' })
  }
}

async function miniQuery(sql) {
  console.log(sql)
  conn.query(sql, async function (error, results, fields) {
    if (error) {
      console.log(error)
      return error
    } else {
      // console.log(results)
      return results
    }
  })
}
module.exports.multiQuerys = async function (body, res) {
  if (body.listaQuerys != undefined) {
    let listCron = []
    for (const k in body.listaQuerys) {
      let responses = miniQuery(body.listaQuerys[k])
      listCron.push({ query: body.listaQuerys[k], result: responses })
    }
    res.status(200).json({ 'querys finalizadas': listCron })
  } else {
    res.status(500).json({ 'erro nos parametros': body })
  }
}

module.exports.confereCode = function (body, res) {
  //console.log(body);
  var qry =
    "select  * from startupandrecover where startupandrecover.mail = sha1('" +
    body.mail +
    "')  and startupandrecover.verifyCode = " +
    body.code
  conn.query(qry, function (error, results, fields) {
    if (results.length > 0) {
      //auth ok
      const id = results[0].id //esse id viria do banco de dados
      const token = jwt.sign({ id }, process.env.MAIN_SECRET, {
        expiresIn: Number(process.env.TIME_TO_EXPIRE_SESSION), // minutes to expire
      })
      return res.json({
        auth: true,
        token: token,
        data: results[0],
        token_me: results[0].token_me,
      })
    } else {
      res.status(500).json({ message: 'Login inválido!' })
    }
    if (error) {
      console.log(error)
    }
  })
}

module.exports.login = function (body, res) {
  //console.log(body);
  var qry =
    'select *, sha1(concat(id,' +
    body.prefix +
    '_mail)) as token_me from ' +
    body.table +
    ' where ' +
    body.prefix +
    "_name = '" +
    body.user +
    "' and " +
    body.prefix +
    "_token = sha1('" +
    body.password +
    "')"
  console.log('query login', qry)
  conn.query(qry, function (error, results, fields) {
    let contando = results && results.length

    if (contando) {
      if (results.length > 0) {
        //auth ok
        const id = results[0].id //esse id viria do banco de dados
        const token = jwt.sign({ id }, process.env.MAIN_SECRET, {
          expiresIn: Number(process.env.TIME_TO_EXPIRE_SESSION), // minutes to expire
        })
        return res.json({
          auth: true,
          token: token,
          data: results[0],
          token_me: results[0].token_me,
        })
      } else {
        res.status(500).json({ message: 'Login inválido!' })
      }
    } else {
      res.status(500).json({ message: 'Login inválido!' })
    }

    if (error) {
      console.log(error)
    }
  })
}

//==========================================================================================================

// Consulta flexível em qualquer tabela baseada no 'id_name' e no 'id_value'
/*
    Os pré-requisitos para funcionamento:
        1- 'id_name' => nome do id em questão ( a ser definido na página da requisição )
        2- 'id_value' => valor a ser verificado para retorno
        3- 'table' => nome da tabela ( a ser definida na página da requisição ).
*/
module.exports.getById = function (body, res) {
  if (body.table && body.id_name && body.id_value) {
    execSQL(
      'select * from ' +
      body.table +
      ' where ' +
      body.id_name +
      " = '" +
      body.id_value +
      "'",
      res
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

module.exports.getTagsLists = function (body, res) {
  if (body.affiliate_id) {
    conn.query(
      'select distinct(product_site_tags) as tags  from product_details where product_affiliate_id = ' +
      body.affiliate_id,
      async function (error3, results3, fields) {
        if (!error3) {
          const resultados = JSON.parse(JSON.stringify(results3))
          let listaTags = [],
            listaPalavras = ''
          for (const k in resultados) {
            listaPalavras += resultados[k].tags
          }
          let novaLista = listaPalavras.split(',')
          listaTags = [...new Set(novaLista)]

          res.status(200).json({ tags: listaTags })
        } else {
        }
      }
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

// Consulta flexível em qualquer tabela baseada no 'id_name' e no 'id_value'
/*
    Os pré-requisitos para funcionamento:
        1- 'id_name' => nome do id em questão ( a ser definido na página da requisição )
        2- 'id_value' => valor a ser verificado para retorno
        3- 'table' => nome da tabela ( a ser definida na página da requisição ).
*/
module.exports.getById_public = function (body, res) {
  if (body.table && body.id_name && body.id_value) {
    execSQL(
      'select * from ' +
      body.table +
      ' where ' +
      body.id_name +
      " = '" +
      body.id_value +
      "'",
      res
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

setInterval(() => {
  ajustaPedidos()
}, 300000)
module.exports.getAllOrdersMaster = function (body, res) {
  var qrt = ''
  if (body.master_id) {
    conn.query(
      'select distinct(id) as id  from affiliates where affiliates_master_id = ' +
      body.master_id,
      async function (error3, results3, fields) {
        if (!error3) {
          if (results3.length > 0) {
            var txt = ''
            for (const k in results3) {
              txt += 'order_affiliate_id = ' + results3[k].id + ' or '
            }
            var manyQuery = 'select * from orders where  ' + txt + '&'
            manyQuery = manyQuery.replace('or &', '')
            qrt = manyQuery
            execSQL(manyQuery, res)
          } else {
            res.status(500).json({
              messageError: 'No results found!',
              yourData: body,
              yourQuery: qrt,
            })
          }
        } else {
          res.status(500).json({
            messageError: 'Problem with database!',
            errorSQL: error3,
            yourMessage: body,
          })
        }
      }
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

// Consulta flexível em produtos baseada em varios product_code
/*
    Os pré-requisitos para funcionamento:
        1- 'id_name' => nome do id em questão ( a ser definido na página da requisição )
        2- 'id_value' => valor a ser verificado para retorno
        3- 'table' => nome da tabela ( a ser definida na página da requisição ).
*/
module.exports.listaIds = function (body, res) {
  //console.log(body);
  if (body.affiliate_id && body.product_list_ids) {
    var query2 = `select 
    distinct(products.product_code),
    products.product_ean,
    products.product_affiliate_id,
    products.product_descricao,
    products.product_valor,
    products.product_categoria,
    products.product_fabricacao,
    products.product_estoque,
    products.product_medida,
    products.product_etiquetas,
    products.product_thumbnail,
    products.product_valor_atacado,
    products.product_quantidade_atacado,
    
    product_details.product_code,
    product_details.product_status,
    product_details.product_site_name,
    product_details.product_site_estoque,
    product_details.product_site_ean,
    product_details.product_site_fabricacao,
    product_details.product_site_description,
    product_details.product_site_categories,
    product_details.product_site_tags,
    product_details.product_site_variations,
    product_details.product_site_info,
    product_details.product_site_nutrition,
    product_details.product_site_value,
    product_details.product_site_discount_value,
    product_details.product_site_discount_type,
    product_details.product_sell_by_weight,
    product_details.product_average_weight_value,
    product_details.product_average_weight_type,
    product_details.product_site_related_title,
    product_details.product_site_related_type,
    product_details.product_site_related_code
    
    from products inner join product_details where `
    var condition = ''
    var lista = body.product_list_ids
    if (lista.length === 0) {
      res.status(200).json([])
    } else {
      for (const k in lista) {
        condition +=
          ' products.product_affiliate_id = ' +
          body.affiliate_id +
          ' and  product_details.product_affiliate_id = ' +
          body.affiliate_id +
          ' and products.product_code = product_details.product_code  ' +
          ' and products.product_code = ' +
          lista[k] +
          ' or'
      }
      query2 += condition + 'limit ' + lista.length
      query2 = query2.replace('orlimit', 'limit')
      console.log('essa qry', query2)
      execSQL(query2, res)
    }
  } else {
    res.status(200).json([])
  }
}

// Consulta de itens de pedido

module.exports.getAllOrderItems = function (body, res) {
  console.log('getAllOrderItems')
  //console.log(body);
  if (body.affiliate_id && body.product_list_ids) {
    var query2 = 'select distinct * from products  where '
    var condition = ''
    var lista = body.product_list_ids
    for (const k in lista) {
      condition +=
        ' product_affiliate_id = ' +
        body.affiliate_id +
        ' and product_code = ' +
        lista[k].product_code +
        ' and product_descricao = "' +
        lista[k].product_descricao +
        '" or'
    }
    query2 += condition + 'limit ' + 999999999
    query2 = query2.replace('orlimit', 'limit')

    console.log('query allItems', query2)
    conn.query(query2, async function (error, results, fields) {
      if (!error) {
        console.log(results)
        var newList = []
        for (const k in results) {
          var qtd = 0,
            valor = 0,
            desconto = 0,
            comentario = '',
            caracteristica = ''
          for (const l in lista) {
            if (
              Number(results[k].product_code) === Number(lista[l].product_code)
            ) {
              qtd = Number(lista[l].quantidade)
              valor = Number(lista[l].valor)
              desconto = Number(lista[l].desconto)
              comentario = lista[l].comentario
              caracteristica = lista[l].caracteristica

              console.log('desc: ' + results[k].product_descricao)
              console.log('quantidade: ' + Number(lista[l].quantidade))
            }
          }
          newList.push({
            id: results[k].id,
            product_affiliate_id: results[k].product_affiliate_id,
            product_code: results[k].product_code,
            product_ean: results[k].product_ean,
            product_descricao: results[k].product_descricao,
            product_valor: results[k].product_valor,
            product_categoria: results[k].product_categoria,
            product_fabricacao: results[k].product_fabricacao,
            product_estoque: results[k].product_estoque,
            product_medida: results[k].product_medida,
            product_etiquetas: results[k].product_etiquetas,
            product_thumbnail: results[k].product_thumbnail,
            comentario: comentario,
            caracteristica: caracteristica,
            quantidade: qtd,
            valor: valor,
            desconto: desconto,
          })
        }

        res.send(newList)
      } else {
        res.status(500).json({
          message: 'Invalid data parameters!',
          erro: error,
          body: body,
        })
      }
    })
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

//==========================================================================================================

// Consulta flexível em qualquer tabela baseada em um parâmetro 'LIKE' em uma coluna específica.
/*
    Os pré-requisitos para funcionamento:
        1- 'column_value' => valor a ser pesquisado.
        2- 'column_name' => nome da coluna.
        3- 'table' => nome da tabela ( a ser definida na página da requisição ).
*/
module.exports.getByLikeParams = function (body, res) {
  if (body.table && body.column_name && body.column_value) {
    execSQL(
      'select * from ' +
      body.table +
      ' where ' +
      body.column_name +
      " like '%" +
      body.column_value +
      "%'",
      res
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

//==========================================================================================================

// Consulta em qualquer tabela que possua relacionamento de usuário.
/*
    Os pré-requisitos para funcionamento:
        1- 'client_id' => id do usuário chave.
        2- 'column_name' => nome da coluna.
        3- 'table' => nome da tabela ( a ser definida na página da requisição ).
*/
module.exports.getByClientId = function (body, res) {
  if (body.table && body.column_name && body.client_id) {
    execSQL(
      'select * from ' +
      body.table +
      ' where ' +
      body.column_name +
      " = '" +
      body.client_id +
      "'",
      res
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

// Atualizar o status do pedido conforme trafega pelas etapas de separação e entrega.
/*
    Os pré-requisitos para funcionamento:
        1- 'client_id' => id do usuário chave.
        2- 'ORDER_STATUS' => Número de status do pedido.
        3- 'DESCRIPTION_STATUS' => Texto descritivo do evento.
        4- 'ORDER_ID' => Número do pedido ( mesmo numero id da tabela ).
*/
module.exports.updateOrderStatus = function (body, res) {
  ajustaPedidos()
  console.log(
    `update orders set order_status = '${body.ORDER_STATUS}', updatedAt = now() where id = ${body.ORDER_ID}`
  )
  if (body.ORDER_ID && body.ORDER_STATUS && body.DESCRIPTION_STATUS) {
    conn.query(
      `update orders set order_status = '${body.ORDER_STATUS}', updatedAt = now() where id = ${body.ORDER_ID}`,
      async function (error, results, fields) {
        if (!error) {
          let SQL = `select users_clients.users_client_mail from users_clients inner join orders where orders.id = ${body.ORDER_ID} and orders.order_client_id = users_clients.id`
          conn.query(SQL, async function (error, results, fields) {
            if (!error) {
              const resultOK = JSON.parse(JSON.stringify(results))
              console.log('esse é o resultado')
              console.log(resultOK)
              resultOK.forEach((m) => {
                if (m.users_client_mail) {
                  if (m.users_client_mail) {
                    informandoPeloEmail(
                      getTitleEmailFromStatus(Number(body.ORDER_STATUS)),
                      m.users_client_mail,
                      body.ORDER_ID
                    )
                  } else {
                    sendMailSendgrid({
                      to: 'rounantj@hotmail.com',
                      from: 'naoresponda@smartcomerci.com',
                      text: 'naoresponda@smartcomerci.com',
                      subject:
                        'erro para : ' +
                        getTitleEmailFromStatus(Number(body.ORDER_STATUS)),
                      html: m.users_client_mail
                        ? m.users_client_mail.toString()
                        : 'veio nulo ' +
                        m.users_client_mail +
                        ', id=> ' +
                        body.ORDER_ID,
                    })
                  }
                }
              })
            }
          })

          execSQL(
            'insert into log_delivery values (null, null, ' +
            body.ORDER_ID +
            ", '" +
            body.ORDER_STATUS +
            "', '" +
            body.DESCRIPTION_STATUS +
            "',now(), now())",
            res
          )
        } else {
          res.status(500).json({ message: 'Invalid data parameters!' })
        }
      }
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

// Atualizar os dados de um pedido.
module.exports.updateOrderDetails = function (body, res) {
  //console.log(body);
  if (body.NUM_PEDIDO && body.VALOR_PEDIDO && body.ITENS_PEDIDO) {
    if (
      body.NUM_PEDIDO != null &&
      body.NUM_PEDIDO != undefined &&
      body.NUM_PEDIDO > 0
    ) {
      execSQL(
        `update orders set order_conteudo = '${body.ITENS_PEDIDO}', order_valor_total = ${body.VALOR_PEDIDO} where id = ${body.NUM_PEDIDO} limit 1`,
        res
      )
    } else {
      res
        .status(500)
        .json({ message: 'Invalid data parameters 1!', detalhes: body })
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters 2!', detalhes: body })
  }
}

// Atualizar os dados de um pedido.
module.exports.updateOrderTotals = function (body, res) {
  if (body.affiliate_id) {
    let fullSql = `select * from orders where order_affiliate_id = ${body.affiliate_id}`

    conn.query(fullSql, async function (error, results, fields) {
      if (!error) {
        let orders = JSON.parse(JSON.stringify(results))
        let itemsAlterados = [],
          errors = []
        let enviaQ = ''
        for (const k in orders) {
          try {
            let items = JSON.parse(orders[k].order_conteudo)
            let totalPedido = 0
            for (const a in items) {
              totalPedido += items[a].quantidade * items[a].valor
            }
            totalPedido += orders[k].order_valor_entrega
            itemsAlterados.push(orders[k].id)

            if (orders[k].id === 422) {
              enviaQ = `update orders set order_valor_total = ${totalPedido} where order_affiliate_id = ${body.affiliate_id} and id = ${orders[k].id}`
            }
            miniQuery(
              `update orders set order_valor_total = ${totalPedido} where order_affiliate_id = ${body.affiliate_id} and id = ${orders[k].id}`
            )
          } catch (erro1) {
            console.log(erro1)
            errors.push(erro1.toString())
          }
        }

        res.status(200).json({
          totalMudancas: itemsAlterados.length,
          totalItems: orders.length,
          errors: errors.length,
          enviaQ,
        })
      } else {
        res.status(500).json({ message: 'Invalid query', detalhes: fullSql })
      }
    })
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters 2!', detalhes: body })
  }
}

// Deletar os dados de um pedido.
module.exports.deleteOrder = function (body, res) {
  //console.log(body);
  if (body.NUM_PEDIDO && body.AFFILIATE_ID) {
    if (
      body.NUM_PEDIDO != null &&
      body.AFFILIATE_ID != undefined &&
      body.NUM_PEDIDO > 0
    ) {
      execSQL(
        'delete from orders where id = ' +
        body.NUM_PEDIDO +
        ' and order_affiliate_id = ' +
        body.AFFILIATE_ID,
        res
      )
    } else {
      res
        .status(500)
        .json({ message: 'Invalid data parameters 1!', detalhes: body })
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters 2!', detalhes: body })
  }
}

//==========================================================================================================

// Atualização flexível de qualquer tabela com base no id
/*
    Os pré-requisitos para funcionamento:
        1- 'fields' => array com as colunas e valores a serem atualizados.
        2- 'name_id' => nome da coluna primária.
        3- 'value_id' => valor do id a ser alterado.
        4- 'table' => nome da tabela ( a ser definida na página da requisição ).
    
    Retornos:
        1- Successo na update, sendo retorno padrão do mysql.
        2- Erro interno com detalhes do field em questão que gerou o problema em 'details'
*/
module.exports.updateById = function (body, res) {
  //console.log(body);
  if (body.table && body.fields.length > 0 && body.name_id && body.value_id) {
    var end = ''
    if (body.table == 'products') {
      end = ' and product_affiliate_id = ' + body.product_affiliate_id
    }
    var fields = body.fields,
      fieldSet = ''
    for (const k in fields) {
      if (fields[k].column.indexOf('id ') > -1) {
        fieldSet += fields[k].column + ' = ' + fields[k].value + ','
      } else {
        fieldSet += fields[k].column + " = '" + fields[k].value + "',"
      }
    }
    fieldSet = fieldSet + 'where'
    fieldSet = fieldSet.replace(',where', ' where ')

    execSQL(
      'update ' +
      body.table +
      ' set ' +
      fieldSet +
      ' ' +
      body.name_id +
      ' = ' +
      body.value_id +
      end,
      res
    )
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourData: body })
  }
}

module.exports.updateByUid = async function (body, res) {
  //console.log(body);
  if (
    body.id &&
    body.product_affiliate_id &&
    body.product_ean &&
    body.product_code
  ) {
    try {
      const {
        id,
        product_affiliate_id,
        product_code,
        product_ean,
        product_descricao,
        product_valor,
        product_categoria,
        product_fabricacao,
        product_estoque,
        product_medida,
        product_etiquetas,
        product_thumbnail,
        product_status,
      } = body
      const Sql1 = `update products set   product_ean  = '${product_ean}', product_descricao  = '${product_descricao}',      product_valor  = '${product_valor}',      product_categoria  = '${product_categoria}',      product_fabricacao  = '${product_fabricacao}',      product_estoque  = '${product_estoque}',      product_medida  = '${product_medida}',      product_etiquetas  = '${product_etiquetas}'     where product_code = ${product_code}  and product_affiliate_id = ${product_affiliate_id}`
      miniQuery(
        `update product_details set product_status = '${product_status}' where product_affiliate_id   = ${product_affiliate_id} and product_code = ${product_code} and product_site_ean = '${product_ean}'`
      )

      execSQL(Sql1, res)
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Invalid data parameters!', yourData: body })
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourData: body })
  }
}

module.exports.deleteListaCompras = async function (body, res) {
  //console.log(body);
  if (body.id && body.lista_affiliate_id && body.lista_client_id) {
    try {
      const { lista_affiliate_id, lista_client_id, id } = body
      const Sql1 = `delete from listas_compras where lista_affiliate_id = ${lista_affiliate_id} and lista_client_id = ${lista_client_id} and id =  ${id} `
      execSQL(Sql1, res)
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Invalid data parameters!', yourData: body })
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourData: body })
  }
}

module.exports.getListaCompras = async function (body, res) {
  //console.log(body);
  if (body.lista_affiliate_id && body.lista_client_id) {
    try {
      const { lista_affiliate_id, lista_client_id } = body
      const Sql1 = `select * from listas_compras where lista_affiliate_id = ${lista_affiliate_id} and lista_client_id = ${lista_client_id} `
      execSQL(Sql1, res)
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Invalid data parameters!', yourData: body })
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourData: body })
  }
}

module.exports.insertListaCompras = async function (body, res) {
  console.log(
    '------------------------------------------------------new list',
    body
  )
  if (
    body.lista_affiliate_id &&
    body.lista_client_id &&
    body.lista_name &&
    body.lista_conteudo
  ) {
    try {
      const {
        lista_affiliate_id,
        lista_client_id,
        lista_name,
        lista_conteudo,
      } = body
      const Sql1 = `insert into listas_compras (id, lista_affiliate_id, lista_client_id, lista_name, lista_conteudo, updatedAt, createdAt) values (null, ${lista_affiliate_id}, ${lista_client_id}, '${lista_name}', '${lista_conteudo}', now(), now())`
      execSQL(Sql1, res)
    } catch (err) {
      res.status(500).json({
        message: 'Invalid data parameters !',
        yourData: body,
        errror: err,
      })
    }
  } else {
    res
      .status(500)
      .json({ message: 'Invalid data parameters!', yourData: body })
  }
}

module.exports.updateListaCompras = async function (body, res) {
  //console.log(body);

  try {
    const {
      id,
      lista_affiliate_id,
      lista_client_id,
      lista_name,
      lista_conteudo,
    } = body
    const Sql1 = `update listas_compras set   lista_name  = '${lista_name}', lista_conteudo  = '${lista_conteudo}', updatedAt = now() where id = ${id} and lista_affiliate_id = ${lista_affiliate_id} and lista_client_id = ${lista_client_id}`
    execSQL(Sql1, res)
  } catch (err) {
    res
      .status(200)
      .json({ message: 'Invalid data parameters!', yourData: body, error: err })
  }
}

//==========================================================================================================

// Insere valores em qualquer tabela
/*
    Os pré-requisitos para funcionamento:
        1- 'fields' => array com as colunas e valores a serem atualizados.
        2- 'table' => nome da tabela ( a ser definida na página da requisição ).
    
    Retornos:
        1- Successo na update, sendo retorno padrão do mysql.
        2- Erro interno com detalhes do field em questão que gerou o problema em 'details'
*/

module.exports.insertNew = async function (body, res) {
  console.log('realizando pedido --------------------------------', body)

  if (body != undefined) {
    try {
      if (body.table === 'products') {
        let fields = body.fields
        console.log('OS FIELDS', fields)
        let product_code = null
        let ital = fields.find((f) => f.column === 'product_code')
        if (ital) {
          product_code = ital.value
        }
        let product_ean = fields.find((f) => f.column === 'product_ean').value
        let product_affiliate_id = fields.find(
          (f) => f.column === 'product_affiliate_id'
        ).value
        let SQL_QUERY = `select * from ${body.table} where product_code = ${product_code} and product_affiliate_id = ${product_affiliate_id} and product_ean = '${product_ean}'`
        conn.query(SQL_QUERY, async function (error, results, fields) {
          if (!error) {
            let resultados = JSON.parse(JSON.stringify(results))
            if (resultados.length > 0) {
              res.status(409).json({
                erro: 'Itens já existem na base, tente atualiza-los',
                fields: body,
                QUERY: SQL_QUERY,
              })
            } else {
              if (body.table.indexOf('user') > -1) {
                res
                  .status(409)
                  .json({ message: 'Users tables not authorized!' })
              } else {
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
                        const { fieldName, value } = fields[k]

                        for (const c in columns) {
                          if (fields[k].column === columns[c].fieldName) {
                            console.log(
                              'a comparação =>',
                              columns[c].fieldType,
                              fields[k].value,
                              !Number(fields[k].value)
                            )
                            if (
                              columns[c].fieldType == 'int(11)' ||
                              columns[c].fieldType == 'int'
                            ) {
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
                              if (
                                !Number(fields[k].value) &&
                                fields[k].value != 0
                              ) {
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
                        console.log(
                          'DEU CERTO_________________________________________________________'
                        )
                        console.log(
                          'insert into ' +
                          body.table +
                          '  ' +
                          byDB +
                          ' values (null, ' +
                          byUser +
                          ' now(), now())'
                        )
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
                        console.log(
                          'ANOMALIA_________________________________________________________'
                        )
                        console.log('anomaly')
                        console.log(anomaly)
                        console.log('columns')
                        console.log(columns)
                        res.status(500).json({
                          message: 'Invalid fields!',
                          Details: anomaly,
                          ExpectedFields: columns,
                          YourFields: fields,
                        })
                      }
                    } else {
                      console.log(
                        'ERRO NA QUERY_________________________________________________________'
                      )
                      console.log(error)
                      res.status(500).json({
                        message: 'Erro na query!',
                        Details: body,
                        errorTXT: error,
                      })
                    }
                  }
                )
              }
            }
          } else {
            console.log(
              'ERRO NA QUERY 3_________________________________________________________'
            )
            res.status(409).json({ erro: error, QUERY_CONSULTA: SQL_QUERY })
          }
        })
      } else {
        if (body.table.indexOf('user') > -1) {
          res.status(409).json({ message: 'Users tables not authorized!' })
        } else {
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
                  const { fieldName, value } = fields[k]

                  for (const c in columns) {
                    if (fields[k].column === columns[c].fieldName) {
                      console.log(
                        'a comparação =>',
                        columns[c].fieldType,
                        fields[k].value,
                        !Number(fields[k].value)
                      )
                      if (
                        columns[c].fieldType == 'int(11)' ||
                        columns[c].fieldType == 'int'
                      ) {
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
                        if (!Number(fields[k].value) && fields[k].value != 0) {
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

                      if (columns[c].fieldType == 'text') {
                        byUser += "'" + fields[k].value + "', "
                        break
                      }
                      byUser += "'" + fields[k].value + "', "
                    }
                  }
                }

                if (anomaly.length === 0 && fields.length == columns.length) {
                  console.log(
                    'ERRO NA QUERY 7_________________________________________________________'
                  )
                  console.log(
                    'insert into ' +
                    body.table +
                    '  ' +
                    byDB +
                    ' values (null, ' +
                    byUser +
                    ' now(), now())'
                  )
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
                  console.log(
                    'insert into ' +
                    body.table +
                    '  ' +
                    byDB +
                    ' values (null, ' +
                    byUser +
                    ' now(), now())'
                  )
                  console.log('anomaly')
                  console.log(anomaly)
                  console.log('columns')
                  console.log(columns)
                  res.status(200).json({
                    message: 'Invalid fields!',
                    Details: anomaly,
                    ExpectedFields: columns,
                    YourFields: fields,
                  })
                }
              } else {
                console.log(error)
                console.log(
                  'ERRO NA QUERY 9________________________________________________________'
                )
                res.status(500).json({
                  message: 'Erro na query!',
                  Details: body,
                  errorTXT: error,
                })
              }
            }
          )
        }
      }
    } catch (erro) {
      console.log(
        'ERRO NA QUERY 4_________________________________________________________',
        erro
      )
      res.status(409).json({
        message: 'Erro!',
        Details: body,
        errorTXT: erro,
        // QUERY_CONSULTA: SQL_QUERY,
      })
    }
  } else {
    console.log(
      'ERRO NA QUERY 5_________________________________________________________'
    )
    res.status(409).json({
      message: 'Erro!',
      Details: body,
      errorTXT: erro,
      //  QUERY_CONSULTA: SQL_QUERY,
    })
  }
}

module.exports.pedidoClienteNovo = async function (body, res) {
  ajustaPedidos()
  //console.log(body);
  if (body != undefined) {
    let newSQL = `insert into users_clients(users_client_affiliate_id, users_client_name, users_client_mail, users_client_telefone, users_client_cpf, users_client_endereco, users_client_numero, users_client_complemento, users_client_cep, users_client_bairro, users_client_cidade)`
    newSQL += ` values("${body.newClient.users_client_affiliate_id}", `
    newSQL += `"${body.newClient.users_client_name}", `
    newSQL += `"${body.newClient.users_client_mail}", `
    newSQL += `"${body.newClient.users_client_telefone}", `
    newSQL += `"${body.newClient.users_client_cpf}", `
    newSQL += `"${body.newClient.users_client_endereco}", `
    newSQL += `"${body.newClient.users_client_numero}", `
    newSQL += `"${body.newClient.users_client_complemento}", `
    newSQL += `"${body.newClient.users_client_cep}", `
    newSQL += `"${body.newClient.users_client_bairro}", `
    newSQL += `"${body.newClient.users_client_cidade}")`

    let idClient = 0
    conn.query(newSQL, function (error, results, fields) {
      if (!error) {
        const resultOk = JSON.parse(JSON.stringify(results))
        console.log('novo cliente inserido 0', resultOk[0])
        console.log('novo cliente inserido 1', resultOk)
        console.log('novo cliente inserido', resultOk['insertId'])
        if (resultOk['insertId']) {
          idClient = resultOk['insertId']

          try {
            if (body.table.indexOf('user') > -1) {
              res.status(409).json({ message: 'Users tables not authorized!' })
            } else {
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
                        if (fields[k].column === columns[c].fieldName) {
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
                            if (
                              !Number(fields[k].value) &&
                              fields[k].value != 0
                            ) {
                              anomaly.push({
                                yourField: fields[k],
                                dbField: columns[c],
                              })
                            }
                            break
                          }

                          if (fields[k].column === 'order_client_id') {
                            if (fields[k].value == 0 && idClient != 0) {
                              fields[k].value = idClient
                            }
                            byUser += Number(fields[k].value) + ', '
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
                      conn.query(
                        'insert into ' +
                        body.table +
                        '  ' +
                        byDB +
                        ' values (null, ' +
                        byUser +
                        ' now(), now())',
                        async function (error, results, fields) {
                          if (!error) {
                            res.status(200).json({
                              resultado: 'success',
                              insertClientId: idClient,
                            })
                          } else {
                            res.status(500).json({
                              resultado: 'error',
                              msgError: error,
                              insertClientId: idClient,
                            })
                          }
                        }
                      )
                    } else {
                      console.log('anomaly')
                      console.log(anomaly)
                      console.log('columns')
                      console.log(columns)
                      res.status(500).json({
                        message: 'Invalid fields!',
                        Details: anomaly,
                        ExpectedFields: columns,
                        YourFields: fields,
                      })
                    }
                  } else {
                    console.log(error)
                    res.status(500).json({
                      message: 'Erro na query!',
                      Details: body,
                      errorTXT: error,
                    })
                  }
                }
              )
            }
          } catch (erro) {
            res
              .status(409)
              .json({ message: 'Erro!', Details: body, errorTXT: erro })
          }
        }
      } else {
        console.log('errei aqui', error)
      }
    })
  } else {
    res.status(409).json({ message: 'Erro!', Details: body, errorTXT: erro })
  }
}
//==========================================================================================================

//==========================================================================================================

// Insere valores em qualquer tabela
/*
    Os pré-requisitos para funcionamento:
        1- 'fields' => array com as colunas e valores a serem atualizados.
        2- 'table' => nome da tabela ( a ser definida na página da requisição ).
    
    Retornos:
        1- Successo na update, sendo retorno padrão do mysql.
        2- Erro interno com detalhes do field em questão que gerou o problema em 'details'
*/
module.exports.insertNewList = function (body, res) {
  try {
    if (body.table.indexOf('user') > -1) {
      res.status(500).json({ message: 'Users tables not authorized!' })
    } else {
      conn.query('desc ' + body.table, async function (error, results, fields) {
        if (!error) {
          var columns = [],
            anomaly = [],
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
          var thisValues = ''

          var list_products = body.product_list

          for (const pl in list_products) {
            var fields = list_products[pl].fields
            var byUser = ''
            for (const k in fields) {
              for (const c in columns) {
                if (fields[k].column === columns[c].fieldName) {
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
                  if (fields.length != columns.length) {
                    byUser += "'" + fields[k].value + "', "

                    anomaly.push({ yourField: fields[k], dbField: columns[c] })

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

            thisValues += '(null, ' + byUser + ' now(), now()),'
          }
          thisValues += ';'
          thisValues = thisValues.replace(',;', ';')

          if (anomaly.length === 0) {
            execSQL(
              'insert into ' +
              body.table +
              '  ' +
              byDB +
              ' values ' +
              thisValues,
              res
            )
          } else {
            res.status(500).json({
              message: 'Invalid fields!',
              Details: anomaly,
              ExpectedFields: columns,
              YourFields: fields,
            })
          }
        } else {
          res.status(500).json({
            message: 'Erro na query!',
            Details: body,
            errorTXT: error,
          })
        }
      })
    }
  } catch (erro) {
    res.status(500).json({ message: 'Erro!', Details: body, errorTXT: erro })
  }
}

//==========================================================================================================

// Inicialização de novo usuário master, com verificação de já existência dos dados informados.
/*
    Os pré-requisitos para funcionamento:
        1- 'mail' => e-mail principal.
    Retornos:
        1- Successo na inserção e no envio do e-mail com o código de 5 dígitos.
        2- Erro interno com detalhes do field em questão que gerou o problema em 'details'
    
    Observação: 
        * Os parametros de conexão para envio de e-mail são setados nas variáveis de ambiente
*/
module.exports.startup = async function (body, res) {
  var code = Math.floor(Math.random() * 99999) + 11111
  code = code.toString().slice(0, 5)
  var message = {
    to: body.mail,
    from: 'no-reply@smartcomerci.com.br',
    subject: 'Confirmação de e-mail.',
    html:
      '<p>Olá seu código de verificação é <b style="font-size: 20px; font-weight: bold">' +
      code +
      '</b>.<br>Ele expira em 02 horas.<br><br><br><br><br>Smartcomerci!<hr>Seu Supermercado online!</p>',
  }

  var parameters = {
    host: process.env.mail,
    port: process.env.mail_port,
    secure: process.env.secure,
    auth: process.env.auth,
    username: process.env.mail_user_name,
    tls: process.env.tls,
  }
  var anomaly = []

  if (
    message.to &&
    message.to != undefined &&
    message.to != null &&
    message.to.indexOf('@') > -1
  ) {
  } else {
    anomaly.push({ field: 'to', toVerify: message.to })
  }

  if (anomaly.length > 0) {
    res.status(500).json({
      messageError: 'Invalid mail parameters or message!',
      details: anomaly,
      yourMessage: body,
    })
  } else {
    conn.query(
      'select * from users_masters where users_master_mail = sha1("' +
      body.mail +
      '")',
      async function (error2, results, fields) {
        if (!error2) {
          if (results.length > 0) {
            res.status(500).json({
              message: 'This e-mail already exists!',
              yourMessage: body,
            })
          } else {
            conn.query(
              'insert into startupandrecover values (null, sha1("' +
              body.mail +
              '"), ' +
              code +
              ', DATE_ADD(NOW(), INTERVAL 2 HOUR), "' +
              moment().format('YYYY-MM-DD hh:mm:ss') +
              '", "' +
              moment().format('YYYY-MM-DD hh:mm:ss') +
              '")',
              async function (error, results, fields) {
                if (!error) {
                  var sender = await sendMailSendgrid(message)

                  res.send({ responseOK: true, responseMSG: sender })
                } else {
                  res.status(500).json({
                    messageError: 'Problem with database!',
                    errorSQL: error,
                    details: anomaly,
                    yourMessage: body,
                  })
                }
              }
            )
          }
        } else {
          res.status(500).json({
            messageError: 'Problem with database!',
            errorSQL: error2,
            details: anomaly,
            yourMessage: body,
          })
        }
      }
    )
  }
}

module.exports.alterMail = async function (body, res) {
  var code = Math.floor(Math.random() * 99999) + 11111
  var message = {
    to: body.toMail,
    from: 'no-reply@smartcomerci.com.br',
    subject: 'Confirmação de e-mail.',
    html:
      '<p>Olá seu código de verificação é <b style="font-size: 20px; font-weight: bold">' +
      code +
      '</b>.<br>Ele expira em 02 horas.<br><br><br><br><br>Smartcomerci!<hr>Seu Supermercado online!</p>',
  }

  var parameters = {
    host: process.env.mail,
    port: process.env.mail_port,
    secure: process.env.secure,
    auth: process.env.auth,
    username: process.env.mail_user_name,
    tls: process.env.tls,
  }
  var anomaly = []

  if (
    message.to &&
    message.to != undefined &&
    message.to != null &&
    message.to.indexOf('@') > -1
  ) {
  } else {
    anomaly.push({ field: 'to', toVerify: message.to })
  }

  if (anomaly.length > 0) {
    res.status(500).json({
      messageError: 'Invalid mail parameters or message!',
      details: anomaly,
      yourMessage: body,
    })
  } else {
    conn.query(
      'select * from users_masters where users_master_mail = sha1("' +
      body.mail +
      '")',
      async function (error2, results, fields) {
        if (!error2) {
          if (results.length > 0) {
            res.status(500).json({
              message: 'This e-mail already exists!',
              yourMessage: body,
            })
          } else {
            conn.query(
              'insert into startupandrecover values (null, sha1("' +
              body.toMail +
              '"), ' +
              code +
              ', DATE_ADD(NOW(), INTERVAL 2 HOUR), "' +
              moment().format('YYYY-MM-DD hh:mm:ss') +
              '", "' +
              moment().format('YYYY-MM-DD hh:mm:ss') +
              '")',
              async function (error, results, fields) {
                if (!error) {
                  var sender = await sendMailSendgrid(message)

                  res.send({ responseOK: true, responseMSG: sender })
                } else {
                  res.status(500).json({
                    messageError: 'Problem with database!',
                    errorSQL: error,
                    details: anomaly,
                    yourMessage: body,
                  })
                }
              }
            )
          }
        } else {
          res.status(500).json({
            messageError: 'Problem with database!',
            errorSQL: error2,
            details: anomaly,
            yourMessage: body,
          })
        }
      }
    )
  }
}

//==========================================================================================================

// Envio de e-mail marketing ou informativo.
/*
    Os pré-requisitos para funcionamento:
        1- 'message' => array contendo os dados 'to, from, html, subject'.
    Retornos:
        1- Successo no envio do e-mail marketing.
        2- Erro interno com detalhes do field em questão que gerou o problema em 'details'
    
    Observação: 
        * Os parametros de conexão para envio de e-mail de marketing devem ser obtidos das filiais pra personalização de domínio.
*/
module.exports.sendNews = function (body, res) {
  var message = body.message

  var parameters = {}
  if (
    body.affiliate_id != null &&
    body.affiliate_id != '' &&
    body.affiliate_id != undefined
  ) {
    conn.query(
      'select * from setup where affiliate_id = ' +
      body.affiliate_id +
      ' limit 1',
      async function (error, results, fields) {
        if (!error) {
          parameters = {
            host: results.host,
            port: results.port,
            secure: results.secure,
            auth: results.auth,
            username: results.mail_user_name,
            tls: results.tls,
          }

          var anomaly = []
          //parameters verify
          if (
            parameters.host &&
            parameters.host != undefined &&
            parameters.host != null &&
            Number(parameters.host)
          ) {
          } else {
            anomaly.push({ field: 'host', toVerify: parameters.host })
          }
          if (
            parameters.port &&
            parameters.port != undefined &&
            parameters.port != null &&
            Number(parameters.port)
          ) {
          } else {
            anomaly.push({ field: 'port', toVerify: parameters.port })
          }
          if (parameters.secure != undefined && parameters.secure != null) {
          } else {
            anomaly.push({ field: 'secure', toVerify: parameters.secure })
          }
          if (parameters.auth != undefined && parameters.auth != null) {
          } else {
            anomaly.push({ field: 'auth', toVerify: parameters.auth })
          }
          if (
            parameters.username &&
            parameters.username != undefined &&
            parameters.username != null &&
            parameters.username.indexOf('@') > -1
          ) {
          } else {
            anomaly.push({ field: 'username', toVerify: parameters.username })
          }
          if (parameters.tls != undefined && parameters.tls != null) {
          } else {
            anomaly.push({ field: 'host', toVerify: parameters.host })
          }
          //message verify
          if (
            message.from != undefined &&
            message.from != null &&
            message.from.indexOf('@') > -1
          ) {
          } else {
            anomaly.push({ field: 'from', toVerify: message.from })
          }
          if (
            message.to != undefined &&
            message.to != null &&
            message.to.indexOf('@') > -1
          ) {
          } else {
            anomaly.push({ field: 'to', toVerify: message.to })
          }
          if (message.subject != undefined && message.subject != null) {
          } else {
            anomaly.push({ field: 'subject', toVerify: message.subject })
          }
          if (message.html != undefined && message.html != null) {
          } else {
            anomaly.push({ field: 'html', toVerify: message.html })
          }
          //anomalys verify
          if (anomaly.length > 0) {
            res.status(500).json({
              messageError: 'Invalid mail parameters or message!',
              details: anomaly,
              youtParameters: parameters,
              yourMessage: message,
            })
          } else {
            var sender = sendMailSendgrid(message)
            res.send(sender)
          }
        } else {
          res.status(500).json({
            messageError: 'Problem with database!',
            yourData: body,
            txtError: error,
          })
        }
      }
    )
  } else {
    res
      .status(500)
      .json({ messageError: 'Affilaite ID not found!', yourData: body })
  }
}

//==========================================================================================================

// Valida o código de 5 dígitos enviado por e-mail.
/*
    Os pré-requisitos para funcionamento:
        1- 'token' => código de 5 dígitos recebido.
        2- 'mail' => e-mail do cliente que recebeu.
    Retornos:
        1- Successo na verificação.
        2- Verificação invalida.
    
*/
module.exports.getValidCode = function (body, res) {
  if (body.token && body.mail) {
    conn.query(
      'select * from startupandrecover where verifyCode = ' +
      body.token +
      " and mail = sha1('" +
      body.mail +
      "') and expires >= now()",
      async function (error, results, fields) {
        if (!error) {
          if (results.length > 0) {
            res.send({ resultOk: true, results: results })
          } else {
            res
              .status(500)
              .json({ messageError: 'No results found!', yourData: body })
          }
        } else {
          res.status(500).json({
            messageError: 'Problem with database!',
            errorSQL: error,
            details: anomaly,
            yourMessage: body,
          })
        }
      }
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

//==========================================================================================================

// Entrega as categorias listadas pelo cliente.
/*
    Os pré-requisitos para funcionamento:
        1- 'affiliate_id' => código de 5 dígitos recebido.
        
    Retornos:
        1- Successo na requisição.
        2- requisição invalida.
    
*/
async function informandoPeloEmail(titulo, email, numeroPedido) {
  let SQL = `select * from users_clients inner join affiliates inner join emails_marketing where users_client_mail = '${email}' and users_client_affiliate_id = affiliates.id and affiliates.affiliates_master_id = emails_marketing.master_id and emails_marketing.tipo_email = '${titulo}'  limit 1`
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
        html: resultOk[0].conteudo
          ? resultOk[0].conteudo.replace(/{{NUMERO_DO_PEDIDO}}/g, numeroPedido)
          : 'Email vazio!',
      })
    }
  })
}

async function sendMailSendgrid(message) {
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(
    process.env.SENDGRID_KEY
  )

  const msg = {
    to: message.to, // Change to your recipient
    from: 'naoresponda@smartcomerci.com.br',
    subject: message.subject,
    text: message.text ? message.text : 'empty',
    html: message.html,
  }

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response)
      console.log(response[0].statusCode)
      console.log(response[0].headers)
      return response
    })
    .catch((error) => {
      console.error(error)
      return JSON.stringify(error)
    })
}

async function sendMailSendgridTESTE(message) {
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(
    process.env.SENDGRID_KEY
  )

  const msg = {
    to: message.to, // Change to your recipient
    from: message.from, // Change to your verified sender
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
module.exports.getCategories = function (body, res) {
  var qrt = ''
  if ((body.affiliate_id, body.master_id)) {
    conn.query(
      'select distinct(id) as id  from affiliates where affiliates_master_id = ' +
      body.master_id,
      async function (error3, results3, fields) {
        if (!error3) {
          if (results3.length > 0) {
            var txt = ''
            for (const k in results3) {
              txt += 'product_affiliate_id = ' + results3[k].id + ' or '
            }
            var manyQuery =
              'select distinct(product_site_categories) from product_details where  ' +
              txt +
              '&'
            manyQuery = manyQuery.replace('or &', '')
            qrt = manyQuery
            console.log('A QUERY', manyQuery)
            conn.query(manyQuery, async function (error, results, fields) {
              if (!error) {
                if (results.length > 0) {
                  res.send({ resultOk: true, results: results })
                } else {
                  res.status(500).json({
                    messageError: 'No results found!',
                    yourData: body,
                    yourQuery: qrt,
                  })
                }
              } else {
                res.status(500).json({
                  messageError: 'Problem with database!',
                  errorSQL: error,
                  yourMessage: body,
                })
              }
            })
          } else {
            res.status(500).json({
              messageError: 'No results found!',
              yourData: body,
              yourQuery: qrt,
            })
          }
        } else {
          res.status(500).json({
            messageError: 'Problem with database!',
            errorSQL: 'error',
            yourMessage: body,
          })
        }
      }
    )
  } else {
    res.status(500).json({ message: 'Invalid data parameters!' })
  }
}

module.exports.insertLogsPromotional = async function (body, res) {
  if (
    body.alteracao &&
    body.alterador &&
    body.affiliate_id &&
    body.discount_id
  ) {
    let SQL = `insert into log_promocoes values (null,${body.affiliate_id},${body.discount_id}, '${body.alteracao}','${body.alterador}',now(),now())`
    execSQL(SQL, res)
  } else {
    res.status(500).json({ message: 'Invalid fields', fields: body })
  }
}

module.exports.getLogsPromotional = async function (body, res) {
  if (body.affiliate_id && body.discount_id) {
    const { affiliate_id, discount_id } = body
    let SQL = `select * from log_promocoes where affiliate_id  = ${affiliate_id} and id_discount = ${discount_id}`
    execSQL(SQL, res)
  } else {
    res.status(500).json({ message: 'Invalid fields', fields: body })
  }
}

module.exports.limpezaDeDuplicados = async function (body, res) {
  if (body.affiliate_id) {
    let fullSql = `select * from product_details where product_affiliate_id = ${body.affiliate_id} order by product_code asc`

    conn.query(fullSql, async function (error, results, fields) {
      if (error) {
        res.status(200).json({ msg: 'Sem produtos a listar!', QUERY: fullSql })
      } else {
        let produtos = JSON.parse(JSON.stringify(results))
        if (!produtos || produtos.length === 0) {
          res
            .status(200)
            .json({ msg: 'Sem produtos a listar!', QUERY: fullSql })
        } else {
          let listaDeletar = [],
            lastPrd
          for (const k in produtos) {
            if (
              lastPrd &&
              produtos[k].product_code === lastPrd.product_code &&
              produtos[k].product_ean === lastPrd.product_ean &&
              produtos[k].product_affiliate_id === lastPrd.product_affiliate_id
            ) {
              let pontos = { a: 0, b: 0 }
              for (const a in lastPrd) {
                if (lastPrd[a]) {
                  pontos.a = pontos.a + 1
                }
              }
              for (const b in produtos[k]) {
                if (produtos[k][b]) {
                  pontos.b = pontos.b + 1
                }
              }
              if (pontos.a < pontos.b) {
                listaDeletar.push({
                  id: lastPrd.id,
                  product_code: lastPrd.product_code,
                  product_ean: lastPrd.id,
                })
              } else {
                listaDeletar.push({
                  id: produtos[k].id,
                  product_code: produtos[k].product_code,
                  product_ean: produtos[k].id,
                })
              }
            }
            lastPrd = produtos[k]
          }

          let queryDelete = 'delete from product_details where id = '

          for (const a in listaDeletar) {
            if (listaDeletar[a].id) {
              queryDelete += listaDeletar[a].id + ' or id = '
            }
          }
          queryDelete += '$'
          queryDelete = queryDelete.replace('or id = $', '')

          res.status(200).json({
            msg: 'Produtos duplicados listados!',
            queryDelete: queryDelete,
            lista: listaDeletar,
            QUERY: fullSql,
          })
        }
      }
    })
  } else {
    res.status(500).json({ message: 'Invalid fields', fields: body })
  }
}

module.exports.limpezaDeDuplicadosOrigin = async function (body, res) {
  if (body.affiliate_id) {
    let fullSql = `select * from products where product_affiliate_id = ${body.affiliate_id} order by product_code asc`

    conn.query(fullSql, async function (error, results, fields) {
      if (error) {
        res.status(200).json({ msg: 'Sem produtos a listar!', QUERY: fullSql })
      } else {
        let produtos = JSON.parse(JSON.stringify(results))
        if (!produtos || produtos.length === 0) {
          res
            .status(200)
            .json({ msg: 'Sem produtos a listar!', QUERY: fullSql })
        } else {
          let listaDeletar = [],
            lastPrd
          for (const k in produtos) {
            if (
              lastPrd &&
              produtos[k].product_code === lastPrd.product_code &&
              produtos[k].product_ean === lastPrd.product_ean &&
              produtos[k].product_affiliate_id === lastPrd.product_affiliate_id
            ) {
              let pontos = { a: 0, b: 0 }
              for (const a in lastPrd) {
                if (lastPrd[a]) {
                  pontos.a = pontos.a + 1
                }
              }
              for (const b in produtos[k]) {
                if (produtos[k][b]) {
                  pontos.b = pontos.b + 1
                }
              }
              if (pontos.a < pontos.b) {
                listaDeletar.push({
                  id: lastPrd.id,
                  product_code: lastPrd.product_code,
                  product_ean: lastPrd.id,
                })
              } else {
                listaDeletar.push({
                  id: produtos[k].id,
                  product_code: produtos[k].product_code,
                  product_ean: produtos[k].id,
                })
              }
            }
            lastPrd = produtos[k]
          }

          let queryDelete = 'delete from products where id = '

          for (const a in listaDeletar) {
            if (listaDeletar[a].id) {
              queryDelete += listaDeletar[a].id + ' or id = '
            }
          }
          queryDelete += '$'
          queryDelete = queryDelete.replace('or id = $', '')

          res.status(200).json({
            msg: 'Produtos duplicados listados!',
            queryDelete: queryDelete,
            lista: listaDeletar,
            QUERY: fullSql,
          })
        }
      }
    })
  } else {
    res.status(500).json({ message: 'Invalid fields', fields: body })
  }
}

module.exports.verifyPicturesAndFolders = async function (body, folder, res) {
  let listStrings = []
  if (fs.existsSync(folder + '/public/pictures_ean')) {
    let listEANs = fs.readdirSync(folder + '/public/pictures_ean', {
      withFileTypes: true,
    })
    console.log('total de imagens', listEANs.length)
    for (const k in listEANs) {
      if (listEANs[k]) {
        console.log(listEANs[k].name)
        listStrings.push(listEANs[k].name.replace('.png', ''))
      }
    }
  } else {
    console.log('folder  inexists')
  }

  if (body.affiliate_id) {
    let fullSql = `select * from products where product_affiliate_id = ${body.affiliate_id}`
    conn.query(fullSql, async function (error, results, fields) {
      if (error) {
        res.status(200).json({ msg: 'Sem produtos a listar!', QUERY: fullSql })
      } else {
        let products = JSON.parse(JSON.stringify(results))
        let listExistImage = []
        for (const j in products) {
          let exists = false,
            origem = ''
          if (
            fs.existsSync(
              `${folder}/public/images/${body.affiliate_id}/${products[j].product_code}`
            )
          ) {
            exists = true
            origem += `/images/${body.affiliate_id}/${products[j].product_code},`
          }
          if (listStrings.find((str) => str === products[j].product_ean)) {
            exists = true
            origem += `/pictures_ean/${products[j].product_ean}.png,`
          }
          if (exists) {
            listExistImage.push({
              product_code: products[j].product_code,
              product_ean: products[j].product_ean,
              origem: origem,
            })
          }
        }

        let queryDisable = `update product_details set status = 'inactive' where  product_affiliate_id = ${body.affiliate_id} and product_code not in (`
        for (const k in listExistImage) {
          queryDisable += `${listExistImage[k].product_code},`
        }
        queryDisable += '&'
        queryDisable += ')'
        queryDisable = queryDisable.replace(',&', '')
        res.status(200).json({
          msg: 'Lista preenchida com codigos de produtos que possuem imagen',
          queryDisable: queryDisable,
          lista: listExistImage,
          listImages: listStrings,
        })
      }
    })
  } else {
    res.status(500).json({ erro: 'Invalid fields', fields: body })
  }
}

module.exports.updateManyInSingleCall = async function (body, res) {
  if (
    body.affiliate_id &&
    body.products_package &&
    Array.isArray(body.products_package)
  ) {
    console.log(body)

    let array = body.products_package

    let listOfQuerys = []
    for (const k in array) {
      console.log(array[k])
      let SQL_UPDATE = `update products set `
      SQL_UPDATE += ` product_valor = ${array[k].product_valor}, product_estoque = ${array[k].product_estoque}, product_valor_atacado = ${array[k].product_valor_atacado}, product_quantidade_atacado = ${array[k].product_quantidade_atacado} `
      SQL_UPDATE += ` where product_affiliate_id = ${body.affiliate_id} and product_code = ${array[k].product_code} and product_ean = '${array[k].product_ean}' `

      let SQL_UPDATE_DETAILS = `update product_details set `
      SQL_UPDATE_DETAILS += ` product_status = '${array[k].product_status}', product_site_value = ${array[k].product_valor} `
      SQL_UPDATE_DETAILS += ` where product_affiliate_id = ${body.affiliate_id} and product_code = ${array[k].product_code}  and product_site_ean = '${array[k].product_ean}'`

      listOfQuerys.push(SQL_UPDATE)
      listOfQuerys.push(SQL_UPDATE_DETAILS)
    }
    let statusQuery = true
    console.log(listOfQuerys)
    try {
      for (const k in listOfQuerys) {
        miniQuery(listOfQuerys[k])
      }
    } catch (err) {
      console.log(err)
      statusQuery = false
    }

    res.status(200).json({
      msg: 'update succefully!',
      statusQuery: statusQuery,
      changes: listOfQuerys.length / 2,
    })
  } else {
    res.status(409).json({
      msg: 'Invalid fields',
      yourFields: body,
      expectedFields: {
        affiliate_id: 'AFFILIATE CODE | STRING OR NUMBER',
        products_package:
          'ARRAY OF PRODUCTS WITH: {product_code, product_ean, product_valor, product_estoque, product_status}',
      },
    })
  }
}

async function queryAsync(sql) {
  console.log(sql)
  conn.query(sql, async function (error, results, fields) {
    if (error) {
      console.log(error)
      return error
    } else {
      return JSON.parse(JSON.stringify(results))
    }
  })
}
