export const environment = {
    apiUrlBase: 'http://',
    apiUrlBaseAzure: 'https://back-comercial-dexter24-cbhbfpagcpckefb2.canadacentral-01.azurewebsites.net/',
    EPlogin: 'api/login',
    EPRefreshToken: 'api/refresh-token',

    EPListarCategoriasServicios: 'api/catService',
    EPListarServiciosPorCat: 'api/prodService/category',
    EPFiltrarClientesPorPatron: 'api/customer/search',

    EPRegistrarCliente: 'api/customer',
    EPActualizarCliente: 'api/customer',
    EPEliminarCliente: 'api/customer',
    EPListarClientes: 'api/customer',
    EPActualizarClienteTelefono: 'api/customer/phone',
    EPListarClientesPaginator: 'api/customer/search/Paginator',

    EPFiltrarServiciosPorPatron: 'api/prodService/search',

    EPRegistrarProdServices: 'api/prodService',
    EPActualizarProdServices: 'api/prodService',
    EPREliminarProdServices: 'api/prodService',
    EPListarProdServices: 'api/prodService',

    EPObtenerNumeracion: 'api/numbersDocument/search',
    EPGrabarGuiaTrabajo: 'api/workGuideMain',
    EPRetiroGuiaTrabajo: 'api/workGuideMain',
    EPObtenerGuiaPorDocumento: 'api/workGuideMain/document',
    EPActualizarGuiaInfoPago: 'api/workGuideMain/updateWorkGuideInfoPay',
    EPActualizarEstadoRecojo: 'api/workGuideMain/pickupDate',
    EPAnularGuia: 'api/workGuideMain/cancelWorkGuide',
    EPCrearAlerta: 'api/workGuideMain/createAlert',
    EPListarAlertas: 'api/workGuideMain/getAlertsByWorkGuide',
    EPDevolverPrendas: 'api/workGuideMain/returnUnwashedClothes',
    EPRecogerItem: 'api/workGuideMain/pickUpItem',

    EPListarGastosPorUsuario: 'api/expenseBox/byUser',
    EPCrearGasto: 'api/expenseBox',
    EPActualizarGasto: 'api/expenseBox',
    EPEliminarGasto: 'api/expenseBox',

    EPAperturaCaja: 'api/cashBox',
    EPRegistrarMovimientosCaja: 'api/cashBox/details',
    EPRegistrarMovimientosCajaOtros: 'api/cashBox/detail/otherIn',
    EPListarCajaPorUsuario: 'api/cashBox/cashboxopenbyuser',
    EPCerrarCaja: 'api/cashBox/close',
    EPListarCajaDetallePorUsuario: 'api/cashBox/detail',
    EPEliminarCajaDetalle: 'api/cashBox/detail',

    EPObtenerIdsPesoLavado: 'api/prodService/getidservicepesolavado',

    // reportes
    EPGuiasPorFecha: 'api/reports/workguides/bydate',
    EPGuiasPorCliente: 'api/reports/workguides/bycustomer',
    EPResumenCajaPorFecha: 'api/cashBox/resume',
    EPResumenCajaPorFechaDetallePorId: 'api/cashBox/detail',

    EPListarUbicaciones: 'api/locationclothes',
    EPCrearUbicacion: 'api/locationclothes',
    EPActualizarUbicacion: 'api/locationclothes',
    EPRegistrarUbicacion: 'api/locationclothes/RegisterWorkGuide',
    EPObtenerCajasPorFecha: 'api/cashBox/resumeAllUser',

    EPDividirPago: 'api/cashBox/splitPayCash',
    EPListarServiciosAccesoRapido: 'api/prodService/getServicesQuickAccess',
    EPdashboardcash: 'api/reports/dashboardcash',

    //falta implementar
    EPGetUsers: 'api/user',
    EPGetUser: 'api/user',
    EPPostUsers: 'api/user',
    EPPutUsers: 'api/user',
    EPDeleteUsers: 'api/user',

    EPGetCompanies: 'api/company',
    EPGetCompany: 'api/company',
    EPGetCompanyByUser: 'api/company/user',
    EPCreateCompany: 'api/company',
    EPUpdateCompany: 'api/company',
    EPDeleteCompany: 'api/company',

    //Tickets
    EPGetClothingWorkerById: 'api/clothingWorker/findById',
    EPCreateTicket: 'api/ticket',

    //sucursales
    EPListarSucursales: 'api/branchSales',
    
    // PURCHASE

    // proveedores
    EPListarProveedores: 'api/supplier',
    EPCrearProveedor: 'api/supplier',
    EPListarProveedoresPaginator: 'api/supplier/search/paginator',
    EPActualizarProveedor: 'api/supplier',
    EPListarProveedoresPorPatron: 'api/supplier/search/byPatron',
    // EPEliminarProveedor: 'api/supplier',
    // EPListarProveedoresPorId: 'api/supplier/searchById',

    // productos
    EPListarProductos: 'api/product',
    EPCrearProducto: 'api/product',
    EPListarProductosPaginator: 'api/product/search/paginator',
    EPActualizarProducto: 'api/product',
    EPListarProductosPorPatron: 'api/product/search/byPatron',
    // EPEliminarProducto: 'api/product',
    // EPListarProductosPorId: 'api/product/searchById',
    // EPListarProductosPorIdProveedor: 'api/product/searchBySupplierId',
    // EPListarProductosPorIdCategoria: 'api/product/searchByCategoryId',
    
    // compras
    EPCrearCompra: 'api/purchase',
    // EPListarCompras: 'api/purchase',
    // EPActualizarCompra: 'api/purchase',
    // EPEliminarCompra: 'api/purchase',
    // EPListarComprasPaginator: 'api/purchase/search/Paginator',
    // EPListarComprasPorPatron: 'api/purchase/search',
    // EPListarComprasPorId: 'api/purchase/searchById',
    // EPListarComprasPorIdProveedor: 'api/purchase/searchBySupplierId',
    // EPListarComprasPorIdProducto: 'api/purchase/searchByProductId',
    // EPListarComprasPorIdCategoria: 'api/purchase/searchByCategoryId',

    //unidad de medida    
    EPListarUnidadMedidaShort: 'api/unitMeasurement/short',
    

    //cateogoria producto
    EPListarCategoriaProductoShort: 'api/categoryProd/short',
    
    // Invoice
    EPListarInvoice: 'api/purchase-invoice',
    EPCrearInvoice: 'api/purchase-invoice',

    // reportes
    EPFacturasPorMes: 'api/purchase/reports/byMonth',
    EPFacturasPorFechas: 'api/purchase/reports/byDate',
    EPFacturasPorProveedor: 'api/purchase/reports/bySupplier',
    EPFacturasPorProducto: 'api/purchase/reports/byProduct',

};
