module.exports.start = function (app, _DIRETORIO_, verifyJWT, express) {
  // Inserindo Rotas e Regras de Negócio
  var routes = require(_DIRETORIO_ + 'routes/routes')

  var business = require(_DIRETORIO_ + 'controllers/business')
  var mongoRepo = require(_DIRETORIO_ + 'controllers/mongo')
  var users = require(_DIRETORIO_ + 'controllers/users')
  var components = require(_DIRETORIO_ + 'controllers/components')
  var documentation = require(_DIRETORIO_ + 'controllers/documentation')
  var ShipayPayment = require(_DIRETORIO_ + 'controllers/payment')
  var payment = new ShipayPayment()
  var package = {
    business,
    users,
    documentation,
    components,
    mongoRepo,
    payment,
  }

  const dbConfig = {
    url: process.env.mongo_string,
  }

  console.log(dbConfig)

  const mongoose = require('mongoose')
  mongoose.Promise = global.Promise

  const db_mongo = {}
  db_mongo.mongoose = mongoose
  db_mongo.url = dbConfig.url
  db_mongo.mongoose
    .connect(db_mongo.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    .then(() => {
      console.log('Mongoose is ok')
    })
    .catch((err) => {
      console.log('Cannot connect in Mongoose!', err)
    })

  // Chamando as rotas
  db_mongo.Categorie = require('./categoriesModel')(db_mongo.mongoose)

  routes.categorie_find(app, package, db_mongo)
  routes.categorie_find_many(app, package, db_mongo)
  routes.categorie_create(app, package, db_mongo, verifyJWT)
  routes.categorie_update(app, package, db_mongo, verifyJWT)
  routes.categorie_delete(app, package, db_mongo, verifyJWT)

  routes.login(app, verifyJWT, package)
  routes.loginCode(app, package)
  routes.salvaEmailPublicidade(app, package)

  routes.loginCodeClient(app, package)

  routes.getAllAffiliates(app, verifyJWT, package)
  routes.getAllProducts(app, verifyJWT, package)
  routes.getByClientId(app, verifyJWT, package)
  routes.getById(app, package)
  routes.getByLikeParams(app, verifyJWT, package)
  routes.updateById(app, verifyJWT, package)
  routes.insertNew(app, verifyJWT, package)
  routes.insertNewList(app, verifyJWT, package)
  routes.newLoginInsert(app, package)
  routes.me(app, verifyJWT, package)
  routes.meToo(app, verifyJWT, package)
  routes.recoverPassword(app, verifyJWT, package)
  routes.documentation(app, package)
  routes.newClientLoginInsert(app, package)
  routes.startup(app, package)
  routes.sendNews(app, verifyJWT, package)
  routes.getValidCode(app, package)
  routes.getFilesUrl(app, package)
  routes.myColors(app, verifyJWT, package)
  routes.uploadLogo(app, verifyJWT, package)
  routes.tables(app, verifyJWT, package)
  routes.getCategories(app, verifyJWT, package)
  routes.totalProducts(app, verifyJWT, package)
  routes.productPictures(app, verifyJWT, package)
  routes.deletePicture(app, verifyJWT, package)
  routes.definePicture(app, verifyJWT, package)
  routes.clearByMasterId(app, verifyJWT, package)
  routes.productsSyncByMasterId(app, verifyJWT, package)
  routes.getMyPicture(app, package)
  routes.getCatList(app, package)
  routes.updateCategoryList(app, verifyJWT, package)
  routes.showProducts(app, package)
  routes.productSearch(app, package)
  routes.productSearchSite(app, package)

  routes.productSearchCat(app, package)
  routes.productsOrderBy(app, package)
  routes.consultaCadastro(app, package)
  routes.getById_public(app, package)
  routes.consultaCadastroCliente(app, package)
  routes.getTagsLists(app, package)

  routes.getStoreInformation(app, package)
  routes.pedidoClienteNovo(app, package)
  routes.sendMailTestFROM(app, package)

  routes.getOrdersTemplate(app, verifyJWT, package)
  routes.productsOrderByListOrder(app, verifyJWT, package)
  routes.getProductsFromOrder(app, verifyJWT, package)
  routes.updateOrderStatus(app, verifyJWT, package)
  routes.updateOrderDetails(app, verifyJWT, package)
  routes.deleteOrder(app, verifyJWT, package)
  routes.updateCart(app, verifyJWT, package)
  routes.usuariosAcessosAdd(app, verifyJWT, package)
  routes.maisUmaCategoria(app, verifyJWT, package)
  routes.updateClientDetailsFront(app, package)

  routes.listaIds(app, package)
  routes.getProductInformation(app, package)

  routes.clientAuth(app, package)
  routes.clientConfere(app, package)

  routes.getAllOrderItems(app, package)

  routes.updateDeliveryDefault(app, verifyJWT, package)
  routes.productAdvancedSearch(app, verifyJWT, package)
  routes.tagsMarcas(app, verifyJWT, package)
  routes.getAllOrdersMaster(app, verifyJWT, package)

  routes.updateCategorieDetail(app, verifyJWT, package)
  routes.getMyOrders(app, package)
  routes.getMyOrders2(app, verifyJWT, package)

  routes.getMyCart(app, package)
  routes.alteraSenhaUsuarioNovo(app, package)

  routes.informacoesDeClientes(app, verifyJWT, package)
  routes.clientAddress(app, verifyJWT, package)

  routes.updateUserDetail(app, package)
  routes.deleteAffiliate(app, verifyJWT, package)
  routes.alterList(app, verifyJWT, package)

  routes.newProduct(app, verifyJWT, package)
  routes.singleUpdate(app, verifyJWT, package)
  routes.getMasterInfo(app, verifyJWT, package)

  routes.autenticateAdmin(app, verifyJWT, package)
  routes.autenticateUser(app, verifyJWT, package)
  routes.autenticateClient(app, verifyJWT, package)

  routes.getMarketInfo(app, verifyJWT, package)
  routes.getByTableName(app, verifyJWT, package)
  routes.clientAuthReverso(app, verifyJWT, package)
  routes.updateMailMarketingContent(app, verifyJWT, package)
  routes.updateByUid(app, verifyJWT, package)

  routes.deleteListaCompras(app, verifyJWT, package)
  routes.getListaCompras(app, verifyJWT, package)
  routes.updateListaCompras(app, verifyJWT, package)
  routes.insertListaCompras(app, verifyJWT, package)
  routes.updateManyInSingleCall(app, verifyJWT, package)

  routes.uploadBanners(app, verifyJWT, package)
  routes.uploadPlanilha(app, verifyJWT, package)
  routes.excel2Json(app, verifyJWT, package)
  routes.multiQuerys(app, verifyJWT, package)
  routes.getContentPage(app, package)
  routes.getHomePage(app, package)
  routes.countByCategoryName(app, package)
  routes.findByCode(app, package)
  routes.getRealatedsDefault(app, package)
  routes.sendMailTest(app, package)
  routes.getMyLinksBanners(app, package)
  routes.productSearchCat2(app, package)
  routes.getXmlFile(app, package)
  routes.updateOrderTotals(app, package)

  routes.verifyPicturesAndFolders(app, package, __dirname)

  routes.limpezaDeDuplicados(app, verifyJWT, package)
  routes.limpezaDeDuplicadosOrigin(app, verifyJWT, package)

  routes.updateUserFromCMS(app, verifyJWT, package)
  routes.setHomePage(app, verifyJWT, package)
  routes.expurgeOrders(app, verifyJWT, package)
  routes.deleteById(app, verifyJWT, package)

  routes.insertLogsPromotional(app, verifyJWT, package)
  routes.getLogsPromotional(app, verifyJWT, package)

  routes.alterMail(app, verifyJWT, package)
  routes.setContentPage(app, verifyJWT, package)

  routes.getSingleTable(app, verifyJWT, package)
  routes.updateAffiliateUsers(app, verifyJWT, package)
  routes.updateAffiliateUsersDetails(app, verifyJWT, package)
  routes.deleteUserAffiliate(app, verifyJWT, package)
  routes.updateRulesUser(app, verifyJWT, package)
  routes.getClientsUsersFromAffiliate(app, verifyJWT, package)
  routes.updateMastersTable(app, verifyJWT, package)
  routes.confereCode(app, package)

  // payment area

  routes.create_payment(app, package, verifyJWT)
  routes.refresh_payment_token(app, package, verifyJWT)
  routes.get_payment(app, package, verifyJWT)
  routes.cancel_payment(app, package, verifyJWT)
  routes.capture_payment(app, package, verifyJWT)
  routes.refound_payment(app, package, verifyJWT)
  routes.list_payments_by_date(app, package, verifyJWT)
  routes.auth_client(app, package, verifyJWT)
  // end payment area
  app.use(express.json())
  app.use(express.static('public'))
  // Apontando a porta e ouvindo as requests
}
