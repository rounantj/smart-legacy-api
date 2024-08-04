var fs = require('fs')
const fs_Promises = require('fs').promises
const mysql = require('mysql2')
var moment = require('moment')

// Importando as variaveis de ambiente
require('dotenv').config()

//==========================================================================================================

// Configurando uma conexão com o database
const conn = mysql.createConnection({
  host: process.env.host,
  port: process.env.port_db,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})

//==========================================================================================================

// Função para executar um comando SQL
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

var _DIRETORIO_ = process.env._DIR_

module.exports.getOrdersTemplate = function (body, res) {
  const queryy = `SELECT *, orders.id AS ORDER_ID, 
  DATE_FORMAT(DATE_SUB(orders.updatedAt, INTERVAL 3 HOUR), "%d/%m/%Y %H:%i") AS DATA_ATUALIZOU,  DATE_FORMAT(DATE_SUB(orders.updatedAt, INTERVAL 3 HOUR), "%d/%m/%Y %H:%i") AS updatedAt,  DATE_FORMAT(DATE_SUB(orders.createdAt, INTERVAL 3 HOUR), "%d/%m/%Y %H:%i") AS createdAt FROM orders INNER JOIN users_clients WHERE order_affiliate_id = `
  if (body.affiliate_id != undefined && body.template != undefined) {
    conn.query(
      //
      queryy +
      // 'select *, orders.id as ORDER_ID, date_format(orders.updatedAt,"%d/%m/%Y %H:%i") as DATA_ATUALIZOU, date_format(orders.updatedAt,"%d/%m/%Y %H:%i") as updatedAt, date_format(orders.createdAt,"%d/%m/%Y %H:%i") as createdAt  from orders inner join users_clients where order_affiliate_id = ' +
      body.affiliate_id +
      ' and orders.order_client_id = users_clients.id order by orders.id desc',
      async function (error2, results, fields) {
        if (!error2) {
          if (Number(body.template) == 1) {
            res.render('order1', { order: results })
          } else {
            res.render('order2', { order: results })
          }
        } else {
          res.send(error2)
        }
      }
    )
  } else {
    res.send('Erro')
  }
}

module.exports.productsOrderByListOrder = function (body, res) {
  if (body.listaProdutos.length > 0 && body.product_affiliate_id != undefined) {
    var conditions =
      'products.product_affiliate_id = product_details.product_affiliate_id ' +
      'and products.product_code = product_details.product_code and products.product_ean = product_details.product_site_ean  and products.product_affiliate_id = ' +
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
      'select *  from products inner join product_details where  ' +
      produtos +
      ' order by products.product_code ASC'
    sql = sql.replace('or order', 'order')
    sql = sql.replace('or  order', 'order')

    console.log('mostrando sql')
    console.log(sql)
    conn.query(sql, async function (error2, results, fields) {
      if (!error2) {
        var listaFinal = []
        for (const k in results) {
          var cara = null,
            anota = null,
            quantidade = 0,
            valor = 0,
            minimo_para_desconto = 0
          for (const u in lista2) {
            if (lista2[u].product_code == results[k].product_code) {
              ; (minimo_para_desconto = lista2[u].minimo_para_desconto),
                (valor = lista2[u].valor),
                (cara = lista2[u].caracteristica),
                (anota = lista2[u].comentario),
                (quantidade = lista2[u].quantidade)
            }
          }
          console.log(results[k])
          listaFinal.push({
            ...results[k],
            quantidade: quantidade,
            caracteristica: cara,
            comentario: anota,
            valor: valor,
            minimo_para_desconto: minimo_para_desconto,
            // "product_affiliate_id":results[k].product_affiliate_id,
            // "product_code":results[k].product_code,
            // "product_ean":results[k].product_ean,
            // "product_descricao":results[k].product_descricao,
            // "product_valor":results[k].product_valor,
            // "product_categoria":results[k].product_categoria,
            // "product_fabricacao":results[k].product_fabricacao,
            // "product_estoque":results[k].product_estoque,
            // "product_medida":results[k].product_medida,
            // "product_etiquetas":results[k].product_etiquetas,
            // "product_thumbnail":results[k].product_thumbnail,
            // "product_status":results[k].product_status,
            // "product_site_name":results[k].product_site_name,
            // "product_site_description":results[k].product_site_description,
            // "product_site_categories":results[k].product_site_categories,
            // "product_site_tags":results[k].product_site_tags,
            // "product_site_variations":results[k].product_site_variations,
            // "product_site_info":results[k].product_site_info,
            // "product_site_nutrition":results[k].product_site_nutrition,
            // "product_site_value":results[k].product_site_value,
            // "product_site_discount_value":results[k].product_site_discount_value,
            // "product_site_discount_type":results[k].product_site_discount_type,
            // "product_sell_by_weight":results[k].product_sell_by_weight,
            // "product_average_weight_value":results[k].product_average_weight_value,
            // "product_average_weight_type":results[k].product_average_weight_type,
            // "product_site_related_title":results[k].product_site_related_title,
            // "product_site_related_type":results[k].product_site_related_type,
            // "product_site_related_code":results[k].product_site_related_code
          })
        }

        res.render('orderList', { lista: listaFinal })
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
