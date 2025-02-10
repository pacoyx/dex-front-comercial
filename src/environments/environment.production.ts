export const environment = {
    apiUrlBase: 'http://64.23.253.167:8080/',
    apiUrlBaseAzure: 'https://back-comercial-dexter24-cbhbfpagcpckefb2.canadacentral-01.azurewebsites.net/',
    EPlogin: 'api/login',
    EPRefreshToken: 'api/refresh-token',
    // apiUrlBase: 'http://64.23.253.167:8080/', // produccion docker DigOcean
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

    EPListarUbicaciones:'api/locationclothes',
    EPCrearUbicacion:'api/locationclothes',
    EPActualizarUbicacion:'api/locationclothes',
    EPRegistrarUbicacion:'api/locationclothes/RegisterWorkGuide',
    EPObtenerCajasPorFecha: 'api/cashBox/resumeAllUser',
    
    EPDividirPago: 'api/cashBox/splitPayCash',
    EPListarServiciosAccesoRapido: 'api/prodService/getServicesQuickAccess',
    
    //falta implementar
    EPGetUsers: 'api/user',
    EPGetUser: 'api/user',
    EPPostUsers: 'api/user',
    EPPutUsers: 'api/user',
    EPDeleteUsers: 'api/user',


    EPGetCompanies:'api/company',
    EPGetCompany:'api/company',
    EPGetCompanyByUser:'api/company/user',
    EPCreateCompany:'api/company',
    EPUpdateCompany:'api/company',
    EPDeleteCompany:'api/company',
};
