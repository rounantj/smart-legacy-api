/*======================= SMARTCOMMERCI ROUTES =========================================================== 

Author: Ronan Rodrigues
Contact: Tel.: 27 996011204, Mail: ronan.rodrigues@pullup.tech
Objective: Definir as rotas da API

=========================================================================================================*/

//==========================================================================================================

const fs = require('fs')
const { upload: UPLOAD_TYPE, uploadFile: UPLOAD_FILE_TYPE } = require('../infra/s3-dapter');

// Rota para listar todos os produtos
module.exports.getAllProducts = function (app, verifyJWT, package) {
  app.post('/getAllProducts', function (req, res) {
    package.business.products(req.body, res)
  })
}

module.exports.insertLogsPromotional = function (app, verifyJWT, package) {
  app.post('/insertLogsPromotional', function (req, res) {
    package.business.insertLogsPromotional(req.body, res)
  })
}

module.exports.getLogsPromotional = function (app, verifyJWT, package) {
  app.post('/getLogsPromotional', function (req, res) {
    package.business.getLogsPromotional(req.body, res)
  })
}

module.exports.updateListaCompras = function (app, verifyJWT, package) {
  app.post('/updateListaCompras', function (req, res) {
    package.business.updateListaCompras(req.body, res)
  })
}

module.exports.insertListaCompras = function (app, verifyJWT, package) {
  app.post('/insertListaCompras', function (req, res) {
    package.business.insertListaCompras(req.body, res)
  })
}

module.exports.getListaCompras = function (app, verifyJWT, package) {
  app.post('/getListaCompras', function (req, res) {
    package.business.getListaCompras(req.body, res)
  })
}

module.exports.deleteListaCompras = function (app, verifyJWT, package) {
  app.post('/deleteListaCompras', function (req, res) {
    package.business.deleteListaCompras(req.body, res)
  })
}

module.exports.updateByUid = function (app, verifyJWT, package) {
  app.post('/updateByUid', function (req, res) {
    package.business.updateByUid(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.expurgeOrders = function (app, verifyJWT, package) {
  app.post('/expurgeOrders', function (req, res) {
    package.business.expurgeOrders(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.deleteById = function (app, verifyJWT, package) {
  app.post('/deleteById', function (req, res) {
    package.business.deleteById(req.body, res)
  })
}

module.exports.updateMailMarketingContent = function (app, verifyJWT, package) {
  app.post('/updateMailMarketingContent', function (req, res) {
    package.business.updateMailMarketingContent(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.clientAuthReverso = function (app, verifyJWT, package) {
  app.post('/clientAuthReverso', function (req, res) {
    package.users.clientAuthReverso(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.consultaCadastroCliente = function (app, package) {
  app.post('/consultaCadastroCliente', function (req, res) {
    package.users.consultaCadastroCliente(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.getRealatedsDefault = function (app, package) {
  app.post('/getRealatedsDefault', function (req, res) {
    package.business.getRealatedsDefault(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.updateOrderTotals = function (app, package) {
  app.post('/updateOrderTotals', function (req, res) {
    package.business.updateOrderTotals(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.getMyLinksBanners = function (app, package) {
  app.post('/getMyLinksBanners', function (req, res) {
    package.business.getMyLinksBanners(req.body, res)
  })
}

module.exports.getXmlFile = function (app, package) {
  app.post('/getXmlFile', function (req, res) {
    package.business.getXmlFile(req.body, res)
  })
}

module.exports.updateMastersTable = function (app, verifyJWT, package) {
  app.post('/updateMastersTable', function (req, res) {
    package.business.updateMastersTable(req.body, res)
  })
}

module.exports.productSearchCat2 = function (app, package) {
  app.post('/productSearchCat2', function (req, res) {
    package.business.productSearchCat2(req.body, res)
  })
}

module.exports.verifyPicturesAndFolders = function (app, package, folder) {
  app.post('/verifyPicturesAndFolders', function (req, res) {
    package.business.verifyPicturesAndFolders(req.body, folder, res)
  })
}

module.exports.updateManyInSingleCall = function (app, verifyJWT, package) {
  app.post('/updateManyInSingleCall', function (req, res) {
    package.business.updateManyInSingleCall(req.body, res)
  })
}

module.exports.findByCode = function (app, package) {
  app.post('/findByCode', function (req, res) {
    package.business.findByCode(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.confereCode = function (app, package) {
  app.post('/confereCode', function (req, res) {
    package.business.confereCode(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.pedidoClienteNovo = function (app, package) {
  app.post('/pedidoClienteNovo', function (req, res) {
    package.business.pedidoClienteNovo(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.countByCategoryName = function (app, package) {
  app.post('/countByCategoryName', function (req, res) {
    package.business.countByCategoryName(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.updateAffiliateUsers = function (app, verifyJWT, package) {
  app.post('/updateAffiliateUsers', function (req, res) {
    package.users.updateAffiliateUsers(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.updateAffiliateUsersDetails = function (
  app,
  verifyJWT,
  package
) {
  app.post('/updateAffiliateUsersDetails', function (req, res) {
    package.users.updateAffiliateUsersDetails(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.updateClientDetailsFront = function (app, package) {
  app.post('/updateClientDetailsFront', function (req, res) {
    package.users.updateClientDetailsFront(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.sendMailTest = function (app, package) {
  app.post('/sendMailTest', function (req, res) {
    package.business.sendMailTest(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.sendMailTestFROM = function (app, package) {
  app.post('/sendMailTestFROM', function (req, res) {
    package.business.sendMailTestFROM(req.body, res)
  })
}

// Rota para listar todos os dados da matriz
module.exports.getMasterInfo = function (app, verifyJWT, package) {
  app.post('/getMasterInfo', function (req, res) {
    package.business.getMasterInfo(req.body, res)
  })
}

// Rota para listar todos os dados da matriz
module.exports.getByTableName = function (app, verifyJWT, package) {
  app.post('/getByTableName', function (req, res) {
    package.business.getByTableName(req.body, res)
  })
}

// Rota para listar todos os dados da matriz
module.exports.autenticateAdmin = function (app, verifyJWT, package) {
  app.post('/autenticateAdmin', function (req, res) {
    package.users.autenticateAdmin(req.body, res)
  })
}

// Rota para listar todos os dados da matriz
module.exports.autenticateUser = function (app, verifyJWT, package) {
  app.post('/autenticateUser', function (req, res) {
    package.users.autenticateUser(req.body, res)
  })
}

// Rota para listar todos os dados da matriz
module.exports.autenticateClient = function (app, verifyJWT, package) {
  app.post('/autenticateClient', function (req, res) {
    package.users.autenticateClient(req.body, res)
  })
}

// Rota para singleUpdate
module.exports.singleUpdate = function (app, verifyJWT, package) {
  app.post('/singleUpdate', function (req, res) {
    package.business.singleUpdate(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.alterList = function (app, verifyJWT, package) {
  app.post('/alterList', function (req, res) {
    package.business.alterList(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.getStoreInformation = function (app, package) {
  app.post('/getStoreInformation', function (req, res) {
    package.business.getStoreInformation(req.body, res)
  })
}

// Rota para atualizar lista de categorias
module.exports.updateCategoryList = function (app, verifyJWT, package) {
  app.post('/updateCategoryList', function (req, res) {
    package.business.updateCategoryList(req.body, res)
  })
}

// Rota para imagens da cosmos
module.exports.getMyPicture = function (app, package) {
  app.post('/getMyPicture', function (req, res) {
    package.business.getMyPicture(req.body, res)
  })
}
// Rota para categorias em listas
module.exports.getCatList = function (app, package) {
  app.post('/getCatList', function (req, res) {
    package.business.getCatList(req.body, res)
  })
}

// Rota para buscar produtos
module.exports.productSearch = function (app, package) {
  app.post('/productSearch', function (req, res) {
    console.log('A BUSCA SEARCH', { body: req.body })
    package.business.productSearch(req.body, res)
  })
}

// Rota para buscar produtos
module.exports.productSearchSite = function (app, package) {
  app.post('/productSearchSite', function (req, res) {
    package.business.productSearchSite(req.body, res)
  })
}

// Rota para buscar produtos
module.exports.productSearchCat = function (app, package) {
  app.post('/productSearchCat', function (req, res) {
    package.business.productSearchCat(req.body, res)
  })
}

// Rota para update de status do pedido
module.exports.updateOrderStatus = function (app, verifyJWT, package) {
  app.post('/updateOrderStatus', verifyJWT, function (req, res) {
    package.business.updateOrderStatus(req.body, res)
  })
}

// Rota para update de status do pedido
module.exports.newProduct = function (app, verifyJWT, package) {
  app.post('/newProduct', verifyJWT, function (req, res) {
    package.business.newProduct(req.body, res)
  })
}

// Rota para listar os produtos de forma ordenada
module.exports.productsOrderBy = function (app, package) {
  app.post('/productsOrderBy', function (req, res) {
    package.business.productsOrderBy(req.body, res)
  })
}

// Rota para atualizar detalhes dos pedidos
module.exports.updateOrderDetails = function (app, verifyJWT, package) {
  app.post('/updateOrderDetails', verifyJWT, function (req, res) {
    console.log(req.body)
    package.business.updateOrderDetails(req.body, res)
  })
}

// Rota para atualizar detalhes dos pedidos
module.exports.listaIds = function (app, package) {
  app.post('/listaIds', function (req, res) {
    console.log(req.body)
    package.business.listaIds(req.body, res)
  })
}

// Rota para atualizar detalhes dos pedidos
module.exports.setContentPage = function (app, verifyJWT, package) {
  app.post('/setContentPage', verifyJWT, function (req, res) {
    package.business.setContentPage(req.body, res)
  })
}

// Rota para atualizar detalhes dos pedidos
module.exports.getProductInformation = function (app, package) {
  app.post('/getProductInformation', function (req, res) {
    console.log(req.body)
    package.business.getProductInformation(req.body, res)
  })
}

// Rota para atualizar detalhes dos pedidos
module.exports.deleteOrder = function (app, verifyJWT, package) {
  app.post('/deleteOrder', verifyJWT, function (req, res) {
    console.log(req.body)
    package.business.deleteOrder(req.body, res)
  })
}

// Rota para atualizar detalhes dos pedidos
module.exports.tagsMarcas = function (app, verifyJWT, package) {
  app.post('/tagsMarcas', verifyJWT, function (req, res) {
    console.log(req.body)
    package.business.tagsMarcas(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.showProducts = function (app, package) {
  app.post('/showProducts', function (req, res) {
    package.business.productsActive(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.getHomePage = function (app, package) {
  app.post('/getHomePage', function (req, res) {
    package.business.getHomePage(req.body, res)
  })
}

// Rota para listar todos os produtos
module.exports.getContentPage = function (app, package) {
  app.post('/getContentPage', function (req, res) {
    package.business.getContentPage(req.body, res)
  })
}

// Rota para sincronizar os produtos com as personalizações
module.exports.productsSyncByMasterId = function (app, verifyJWT, package) {
  app.post('/productsSyncByMasterId', function (req, res) {
    package.business.productsSyncByMasterId(req.body, res)
  })
}
// Rota para sincronizar os produtos com as personalizações
module.exports.informacoesDeClientes = function (app, verifyJWT, package) {
  app.post('/informacoesDeClientes', function (req, res) {
    package.users.informacoesDeClientes(req.body, res)
  })
}

// Rota para sincronizar os produtos com as personalizações
module.exports.getAllOrdersMaster = function (app, verifyJWT, package) {
  app.post('/getAllOrdersMaster', function (req, res) {
    package.business.getAllOrdersMaster(req.body, res)
  })
}

// Rota para sincronizar os produtos com as personalizações
module.exports.productAdvancedSearch = function (app, verifyJWT, package) {
  app.post('/productAdvancedSearch', function (req, res) {
    package.business.productAdvancedSearch(req.body, res)
  })
}

// Rota para limpar uma tabela pela id master
module.exports.clearByMasterId = function (app, verifyJWT, package) {
  app.post('/clearByMasterId', function (req, res) {
    package.business.clearByMasterId(req.body, res)
  })
}

// Rota para listar todos os afiliados
module.exports.getAllAffiliates = function (app, verifyJWT, package) {
  app.post('/getAllAffiliates', function (req, res) {
    package.business.affiliates(req.body, res)
  })
}

// Rota para listar todos os afiliados
module.exports.getSingleTable = function (app, verifyJWT, package) {
  app.post('/getSingleTable', function (req, res) {
    package.business.getSingleTable(req.body, res)
  })
}

// Rota para login do adm
module.exports.login = function (app, verifyJWT, package) {
  app.post('/login', function (req, res) {
    package.business.login(req.body, res)
  })
}

// Rota para login do cliente
module.exports.clientAuth = function (app, package) {
  app.post('/clientAuth', function (req, res) {
    package.users.clientAuth(req.body, res)
  })
}

module.exports.limpezaDeDuplicados = function (app, verifyJWT, package) {
  app.post('/limpezaDeDuplicados', function (req, res) {
    package.business.limpezaDeDuplicados(req.body, res)
  })
}

module.exports.limpezaDeDuplicadosOrigin = function (app, verifyJWT, package) {
  app.post('/limpezaDeDuplicadosOrigin', function (req, res) {
    package.business.limpezaDeDuplicadosOrigin(req.body, res)
  })
}

// Rota para login do cliente
module.exports.clientConfere = function (app, package) {
  app.post('/clientConfere', function (req, res) {
    package.users.clientConfere(req.body, res)
  })
}

module.exports.getTagsLists = function (app, package) {
  app.post('/getTagsLists', function (req, res) {
    package.business.getTagsLists(req.body, res)
  })
}

//==========================================================================================================
// Rota para busca baseada no ID

module.exports.getById = function (app, package) {
  app.post('/getById', function (req, res) {
    package.business.getById(req.body, res)
  })
}

module.exports.maisUmaCategoria = function (app, verifyJWT, package) {
  app.post('/maisUmaCategoria', verifyJWT, function (req, res) {
    package.business.maisUmaCategoria(req.body, res)
  })
}

module.exports.getById_public = function (app, package) {
  app.post('/getById_public', function (req, res) {
    package.business.getById_public(req.body, res)
  })
}

module.exports.usuariosAcessosAdd = function (app, verifyJWT, package) {
  app.post('/usuariosAcessosAdd', verifyJWT, function (req, res) {
    package.business.usuariosAcessosAdd(req.body, res)
  })
}

module.exports.consultaCadastro = function (app, package) {
  app.post('/consultaCadastro', function (req, res) {
    package.users.consultaCadastro(req.body, res)
  })
}

module.exports.salvaEmailPublicidade = function (app, package) {
  app.post('/salvaEmailPublicidade', function (req, res) {
    package.users.salvaEmailPublicidade(req.body, res)
  })
}

module.exports.setHomePage = function (app, verifyJWT, package) {
  app.post('/setHomePage', function (req, res) {
    package.business.setHomePage(req.body, res)
  })
}

module.exports.loginCode = function (app, package) {
  app.post('/loginCode', function (req, res) {
    package.business.loginCode(req.body, res)
  })
}

module.exports.loginCodeClient = function (app, package) {
  app.post('/loginCodeClient', function (req, res) {
    package.business.loginCodeClient(req.body, res)
  })
}

module.exports.getMarketInfo = function (app, verifyJWT, package) {
  app.post('/getMarketInfo', function (req, res) {
    package.business.getMarketInfo(req.body, res)
  })
}

//==========================================================================================================
// Rota para update de detalhe da categoria

module.exports.updateCategorieDetail = function (app, verifyJWT, package) {
  app.post('/updateCategorieDetail', verifyJWT, function (req, res) {
    package.business.updateCategorieDetail(req.body, res)
  })
}

//==========================================================================================================
// Rota para busca baseada em um parâmetro 'LIKE'

module.exports.getByLikeParams = function (app, verifyJWT, package) {
  app.post('/getByLikeParams', verifyJWT, function (req, res) {
    package.business.getByLikeParams(req.body, res)
  })
}

//==========================================================================================================
// Rota para busca baseada em usuário chave

module.exports.getByClientId = function (app, verifyJWT, package) {
  app.post('/getByClientId', verifyJWT, function (req, res) {
    package.business.getByClientId(req.body, res)
  })
}

//==========================================================================================================
// Rota para update de dados pelo ID

module.exports.updateById = function (app, verifyJWT, package) {
  app.post('/updateById', verifyJWT, function (req, res) {
    package.business.updateById(req.body, res)
  })
}

//==========================================================================================================
// Rota para inserir dados em tabelas

module.exports.insertNew = function (app, verifyJWT, package) {
  app.post('/insertNew', verifyJWT, function (req, res) {
    console.log(req.body)
    package.business.insertNew(req.body, res)
  })
}

//==========================================================================================================
// Rota para inserir dados em tabelas em lista

module.exports.insertNewList = function (app, verifyJWT, package) {
  app.post('/insertNewList', verifyJWT, function (req, res) {
    package.business.insertNewList(req.body, res)
  })
}

//==========================================================================================================
// Rota para inserir um novo usuário ( tratado de forma separa das outras tabelas )

module.exports.newLoginInsert = function (app, package) {
  app.post('/newLoginInsert', function (req, res) {
    console.log(req.body)
    package.users.insertNew(req.body, res)
  })
}

//==========================================================================================================
// Rota para inserir um novo usuário cliente ( tratado de forma separa das outras tabelas )

module.exports.newClientLoginInsert = function (app, package) {
  app.post('/newClientLoginInsert', function (req, res) {
    package.users.newClientLoginInsert(req.body, res)
  })
}

//==========================================================================================================
// Rota para atualizar usuario

module.exports.updateUserDetail = function (app, package) {
  app.post('/updateUserDetail', function (req, res) {
    package.users.updateUserDetail(req.body, res)
  })
}

//==========================================================================================================
// Rota para recuperar password

module.exports.recoverPassword = function (app, verifyJWT, package) {
  app.post('/recoverPassword', verifyJWT, function (req, res) {
    package.users.recoverPassword(req.body, res)
  })
}

//==========================================================================================================
// Rota para recuperar password

module.exports.updateDeliveryDefault = function (app, verifyJWT, package) {
  app.post('/updateDeliveryDefault', verifyJWT, function (req, res) {
    package.business.updateDeliveryDefault(req.body, res)
  })
}

//==========================================================================================================
// Rota para identificar usuário

module.exports.me = function (app, verifyJWT, package) {
  app.post('/me', verifyJWT, function (req, res) {
    package.business.me(req.body, res)
  })
}

//==========================================================================================================
// Rota para identificar usuário

module.exports.meToo = function (app, verifyJWT, package) {
  app.post('/meToo', verifyJWT, function (req, res) {
    package.business.meToo(req.body, res)
  })
}

//==========================================================================================================
// Rota para lista de items de pedido

module.exports.productsOrderByListOrder = function (app, verifyJWT, package) {
  app.post('/productsOrderByListOrder', verifyJWT, function (req, res) {
    package.components.productsOrderByListOrder(req.body, res)
  })
}

//==========================================================================================================
// Rota para a documentação

module.exports.documentation = async function (app, package) {
  app.get('/documentation', async function (req, res) {
    package.documentation.getDocumentation(res)
  })
}

//==========================================================================================================
// Rota REST de items de pedido

module.exports.getProductsFromOrder = async function (app, verifyJWT, package) {
  app.post('/getProductsFromOrder', verifyJWT, async function (req, res) {
    package.business.getProductsFromOrder(req.body, res)
  })
}

// Rota REST de items de pedido

module.exports.clientAddress = async function (app, verifyJWT, package) {
  app.post('/clientAddress', verifyJWT, async function (req, res) {
    package.users.clientAddress(req.body, res)
  })
}

//==========================================================================================================
// Rota para os componentes Ordem 1

module.exports.getOrdersTemplate = async function (app, verifyJWT, package) {
  app.post('/getOrdersTemplate', verifyJWT, async function (req, res) {
    package.components.getOrdersTemplate(req.body, res)
  })
}

//==========================================================================================================
// Rota para os componentes Ordem 1

module.exports.getAllOrderItems = async function (app, package) {
  app.post('/getAllOrderItems', async function (req, res) {
    package.business.getAllOrderItems(req.body, res)
  })
}

//==========================================================================================================
// Rota para os componentes Ordem 1

module.exports.updateCart = async function (app, verifyJWT, package) {
  app.post('/updateCart', verifyJWT, async function (req, res) {
    package.business.updateCart(req.body, res)
  })
}

//==========================================================================================================
// Rota para pedidos

module.exports.getMyOrders = async function (app, package) {
  app.post('/getMyOrders', async function (req, res) {
    package.business.getMyOrders(req.body, res)
  })
}

module.exports.getMyOrders2 = async function (app, package) {
  app.post('/getMyOrders2', async function (req, res) {
    package.business.getMyOrders2(req.body, res)
  })
}

module.exports.alteraSenhaUsuarioNovo = async function (app, package) {
  app.post('/alteraSenhaUsuarioNovo', async function (req, res) {
    package.users.alteraSenhaUsuarioNovo(req.body, res)
  })
}

//==========================================================================================================
// Rota para carrinho

module.exports.getMyCart = async function (app, package) {
  app.post('/getMyCart', async function (req, res) {
    package.business.getMyCart(req.body, res)
  })
}

//==========================================================================================================
// Rota para primeiro acesso como matriz

module.exports.startup = async function (app, package) {
  app.post('/startup', async function (req, res) {
    package.business.startup(req.body, res)
  })
}

module.exports.multiQuerys = async function (app, verifyJWT, package) {
  app.post('/multiQuerys', async function (req, res) {
    package.business.multiQuerys(req.body, res)
  })
}

//==========================================================================================================
// Rota para envio de e-mail marketing

module.exports.sendNews = async function (app, verifyJWT, package) {
  app.post('/sendNews', verifyJWT, async function (req, res) {
    package.business.sendNews(req.body, res)
  })
}

//==========================================================================================================
// Rota para verificar código de 5 dígitos

module.exports.getValidCode = async function (app, package) {
  app.post('/getValidCode', async function (req, res) {
    package.business.getValidCode(req.body, res)
  })
}

//==========================================================================================================
// Rota para realizar upload da logotipo

module.exports.uploadLogo = async function (app, verifyJWT, package) {
  app.post(
    '/uploadLogo/:affiliate_id/:product_code/:is_product_image',
    verifyJWT,
    (req, res) => {
      try {
        console.log('AS INSTRUCOES', {
          body: req.body,
          headers: req.headers,
        })
        if (
          req.params.affiliate_id != undefined &&
          req.params.affiliate_id != '' &&
          req.params.affiliate_id != null
        ) {
          const formidable = require('formidable')
          const form = new formidable.IncomingForm()
          const dir = './public/images/' + req.params.affiliate_id

          if (
            req.params.is_product_image == true ||
            req.params.is_product_image == 'true'
          ) {
            if (
              req.params.product_code != undefined &&
              req.params.product_code != '' &&
              req.params.product_code != null
            ) {
              var product_code = req.params.product_code
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir)
              }
              console.log('PASTA EXISTE', {
                pasta: dir + '/' + product_code,
                existe: fs.existsSync(dir + '/' + product_code),
              })
              if (!fs.existsSync(dir + '/' + product_code)) {
                fs.mkdirSync(dir + '/' + product_code)
                console.log('PASTA CRIOU', {
                  pasta: dir + '/' + product_code,
                  existe: fs.existsSync(dir + '/' + product_code),
                })
              }

              form.parse(req, (err, fields, files) => {
                console.log(files)
                const path = require('path')
                const oldpath = files.fileimagem.path
                //const newpath = path.join("", './apps/www.smartcommerci.co-api/src/data/images/'+req.headers.affiliate_id+'/', files.fileimage.name);
                const newpath = path.join(
                  '',
                  './public/images/' +
                  req.params.affiliate_id +
                  '/' +
                  product_code +
                  '/',
                  files.fileimagem.name
                )
                fs.renameSync(oldpath, newpath)
                res.send({ resultOk: true, message: 'File uploaded' })
              })
            } else {
              res
                .status(500)
                .json({ message: 'Invalid data parameters!', yourData: req })
            }
          } else {
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir)
            }

            form.parse(req, (err, fields, files) => {
              const path = require('path')
              const oldpath = files.fileimagem.path
              const newpath = path.join(
                '',
                './public/images/' + req.params.affiliate_id + '/',
                files.fileimagem.name
              )
              fs.renameSync(oldpath, newpath)
              res.send({
                resultOk: true,
                message: 'File uploaded no product',
              })
            })
          }
        } else {
          res.status(500).json({
            message: 'Invalid data parameters!',
            yourData: 'error here',
          })
        }
      } catch (error) {
        console.log(error)
        res.status(500).json({
          message: 'Invalid data parameters!',
          yourData: 'error here out',
          errorMessage: error,
        })
      }
    }
  )
}

module.exports.uploadPlanilha = async function (app, verifyJWT, package) {
  app.post('/uploadPlanilha', verifyJWT, async (req, res) => {
    let xlsxtojson = require('xlsx-to-json')
    let xlstojson = require('xls-to-json')
    let fileExtension = require('file-extension')
    try {
      const formidable = require('formidable')
      const form = new formidable.IncomingForm()
      const dir = './public/images/' + req.headers.affiliate_id

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }

      await form.parse(req, async (err, fields, files) => {
        //console.log("os files", files);
        const path = require('path')
        const oldpath = files.fileimagem.path
        //const newpath = path.join("", './apps/www.smartcommerci.co-api/src/data/images/'+req.headers.affiliate_id+'/', files.fileimage.name);
        const newpath = path.join(
          '',
          './public/images/' + req.headers.affiliate_id + '/',
          files.fileimagem.name
        )
        var myFile =
          './public/images/' +
          req.headers.affiliate_id +
          '/' +
          files.fileimagem.name
        console.log('my file', myFile)
        fs.renameSync(oldpath, newpath)

        let excel2json
        if (
          files.fileimagem.name.split('.')[
          files.fileimagem.name.split('.').length - 1
          ] === 'xlsx'
        ) {
          excel2json = xlsxtojson
        } else {
          excel2json = xlstojson
        }
        console.log('novo caminho ', newpath)
        res.send({
          resultOk: true,
          message: 'File uploaded',
          path: myFile,
          filename: files.fileimagem.name,
        })
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ erro: error })
    }
  })
}

module.exports.excel2Json = function (app, verifyJWT, package) {
  app.post('/excel2Json', verifyJWT, (req, res) => {
    let xlsxtojson = require('xlsx-to-json')
    let xlstojson = require('xls-to-json')
    let fileExtension = require('file-extension')
    let excel2json
    if (
      req.headers.filename.split('.')[
      req.headers.filename.split('.').length - 1
      ] === 'xlsx'
    ) {
      console.log('xlsx')
      excel2json = xlsxtojson
    } else {
      console.log('xls')
      excel2json = xlstojson
    }

    try {
      excel2json(
        {
          input:
            './public/images/' +
            req.headers.affiliate_id +
            '/' +
            req.headers.filename,
          output:
            './public/images/' +
            req.headers.affiliate_id +
            '/' +
            Date.now() +
            '.json', // output json
          lowerCaseHeaders: true,
        },
        function (err, result) {
          if (err) {
            console.log('meu erro', err)
            res.send({ resultOk: true, message: 'File uploaded', erro: err })
          } else {
            console.log('meu dado', result)
            res.send({
              resultOk: true,
              message: 'File uploaded',
              dados: result,
            })
          }
        }
      )
    } catch (error) {
      console.log('erro em excel2Json', error)
      res.status(500).json({ erro: 'Algo saiu errado' })
    }
  })
}

//==========================================================================================================
// Rota para realizar upload da logotipo


module.exports.uploadBanners = function (app, verifyJWT) {
  app.put('/uploadBanners/:master_id', verifyJWT, UPLOAD_TYPE.single("fileimagem"), async (req, res) => {
    try {
      if (req.params.master_id) {

        const file = req.file;
        const bucketName = 'smart-images';
        const keyPrefix = 'masters/' + req.params.master_id;
        if (!file) {
          return res.status(400).send('Nenhum arquivo foi enviado.');
        }
        const url = await UPLOAD_FILE_TYPE(file, bucketName, keyPrefix);
        res.send({
          resultOk: true,
          message: 'File uploaded',
          path: url,
          fileNameIn: file.name,
        });
      } else {
        res.status(500).json({
          headers: req.headers,
          message: 'Invalid data parameters!',
          yourData: 'error here',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Invalid data parameters!',
        yourData: 'error here out',
        errorMessage: error,
      });
    }
  });
};
//==========================================================================================================
// Rota para realizar upload da logotipo

module.exports.deletePicture = async function (app, verifyJWT, package) {
  app.post('/deletePicture', verifyJWT, (req, res) => {
    try {
      if (
        req.body.affiliate_id != null &&
        req.body.affiliate_id != undefined &&
        req.body.affiliate_id != '' &&
        req.body.product_code != null &&
        req.body.product_code != undefined &&
        req.body.product_code != '' &&
        req.body.picture_name != null &&
        req.body.picture_name != undefined &&
        req.body.picture_name != ''
      ) {
        var filePath =
          './public/images/' +
          req.body.affiliate_id +
          '/' +
          req.body.product_code +
          '/' +
          req.body.picture_name
        try {
          fs.unlinkSync(filePath)
          res.send('file deleted!')
        } catch (erro1) {
          res.status(500).json({
            message: 'unlink fail!',
            yourData: req.body,
            errorMessage: erro1,
          })
        }
      } else {
        res
          .status(500)
          .json({ message: 'Invalid data parameters!', yourData: req.body })
      }
    } catch (error) {
      res.status(500).json({
        message: 'Internal error!',
        yourData: 'error in picture delete',
        errorMessage: error,
      })
    }
  })
}

//==========================================================================================================
// Rota para coletar as cores da logotipo enviada

module.exports.myColors = async function (app, verifyJWT, package) {
  app.post('/myColors', async function (req, res) {
    console.log(req.body)
    console.log(req.headers.filename)
    const path = require('path')
    const getColors = require('get-image-colors')
    getColors(
      path.join(
        './public/images/' + req.headers.user_id + '/',
        req.headers.filename
      )
    )
      .then((colors) => {
        res.send(colors)
      })
      .catch((error) => {
        res.send(error)
      })
  })
}

//==========================================================================================================
// Rota para coletar as imagens cadastradas por produto

module.exports.productPictures = async function (app, verifyJWT, package) {
  app.post('/productPictures', async function (req, res) {
    package.business.productPictures(req.body, res)
  })
}

//==========================================================================================================
// Rota para setar imagem padrão

module.exports.definePicture = async function (app, verifyJWT, package) {
  app.post('/definePicture', async function (req, res) {
    package.business.definePicture(req.body, res)
  })
}

//==========================================================================================================
// Rota coringa

module.exports.tables = function (app, verifyJWT, package) {
  app.post('/smartTables', verifyJWT, function (req, res) {
    package.users.tables(req.body, res)
  })
}

//==========================================================================================================
// Rota para categorias

module.exports.getCategories = function (app, verifyJWT, package) {
  app.post('/getCategories', verifyJWT, function (req, res) {
    package.business.getCategories(req.body, res)
  })
}

//==========================================================================================================
// Rota contagem de produtos

module.exports.totalProducts = function (app, verifyJWT, package) {
  app.post('/totalProducts', verifyJWT, function (req, res) {
    package.business.totalProducts(req.body, res)
  })
}

//==========================================================================================================
// Rota contagem de produtos

module.exports.deleteAffiliate = function (app, verifyJWT, package) {
  app.post('/deleteAffiliate', verifyJWT, function (req, res) {
    package.business.deleteAffiliate(req.body, res)
  })
}

module.exports.updateUserFromCMS = function (app, verifyJWT, package) {
  app.post('/updateUserFromCMS', verifyJWT, function (req, res) {
    package.users.updateUserFromCMS(req.body, res)
  })
}

module.exports.alterMail = function (app, verifyJWT, package) {
  app.post('/alterMail', verifyJWT, function (req, res) {
    package.business.alterMail(req.body, res)
  })
}

module.exports.deleteUserAffiliate = function (app, verifyJWT, package) {
  app.post('/deleteUserAffiliate', verifyJWT, function (req, res) {
    package.users.deleteUserAffiliate(req.body, res)
  })
}

module.exports.updateRulesUser = function (app, verifyJWT, package) {
  app.post('/updateRulesUser', verifyJWT, function (req, res) {
    package.users.updateRulesUser(req.body, res)
  })
}

module.exports.getClientsUsersFromAffiliate = function (
  app,
  verifyJWT,
  package
) {
  app.post('/getClientsUsersFromAffiliate', verifyJWT, function (req, res) {
    package.users.getClientsUsersFromAffiliate(req.body, res)
  })
}

// ROUTES FOR MONGO DB CRUD
module.exports.categorie_find = function (app, package, db) {
  app.get('/categorie_find/:affiliateId', function (req, res) {
    package.mongoRepo.categorie_find(req.body, db, res, req.params.affiliateId)
  })
}

module.exports.categorie_find_many = function (app, package, db) {
  app.post('/categorie_find_many', function (req, res) {
    package.mongoRepo.categorie_find_many(req.body, db, res)
  })
}

module.exports.categorie_create = function (app, package, db, verifyJWT) {
  app.post('/categorie_create', verifyJWT, function (req, res) {
    package.mongoRepo.categorie_create(req.body, db, res)
  })
}

module.exports.categorie_update = function (app, package, db, verifyJWT) {
  app.post('/categorie_update/:affiliateId', verifyJWT, function (req, res) {
    package.mongoRepo.categorie_update(
      req.body,
      db,
      res,
      req.params.affiliateId
    )
  })
}

module.exports.categorie_delete = function (app, package, db, verifyJWT) {
  app.post('/categorie_delete/:_id', verifyJWT, function (req, res) {
    package.mongoRepo.categorie_delete(req.body, db, res, req.params._id)
  })
}

// PAYMENT AREA
module.exports.create_payment = function (app, package, verifyJWT) {
  app.post('/create_payment', verifyJWT, function (req, res) {
    package.payment.createPayment(req.body, res)
  })
}

module.exports.refresh_payment_token = function (app, package, verifyJWT) {
  app.post('/refresh_payment_token', verifyJWT, function (req, res) {
    package.payment.refreshToken(req.body.refreshToken, res)
  })
}

module.exports.get_payment = function (app, package, verifyJWT) {
  app.post('/get_payment', verifyJWT, function (req, res) {
    package.payment.getPayment(req.body.id, res)
  })
}

module.exports.cancel_payment = function (app, package, verifyJWT) {
  app.post('/cancel_payment', verifyJWT, function (req, res) {
    package.payment.cancelPayment(req.body.id, res)
  })
}

module.exports.capture_payment = function (app, package, verifyJWT) {
  app.post('/capture_payment', verifyJWT, function (req, res) {
    package.payment.capturePayment(req.body.id, req.body.amount, res)
  })
}

module.exports.refound_payment = function (app, package, verifyJWT) {
  app.post('/refound_payment', verifyJWT, function (req, res) {
    package.payment.refundPayment(req.body.id, req.body.amount, res)
  })
}

module.exports.list_payments_by_date = function (app, package, verifyJWT) {
  app.post('/list_payments_by_date', verifyJWT, function (req, res) {
    package.payment.listPaymentsByDate(
      req.body.start_date,
      req.body.end_date,
      res
    )
  })
}

module.exports.auth_client = function (app, package, verifyJWT) {
  app.post('/auth_client', verifyJWT, function (req, res) {
    package.payment.authenticateClient(
      req.body.access_key,
      req.body.client_id,
      req.body.secret_key,
      res
    )
  })
}
