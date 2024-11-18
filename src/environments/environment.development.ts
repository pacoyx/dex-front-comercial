export const environment = {
    apiUrlBase: 'https://localhost:7253/',
    EPlogin: 'api/login',
    EPListarCategoriasServicios: 'api/catService',
    EPListarServiciosPorCat: 'api/prodService/category',
    EPFiltrarClientesPorPatron: 'api/customer/search',
    
    EPRegistrarCliente: 'api/customer',
    EPActualizarCliente: 'api/customer',
    EPEliminarCliente: 'api/customer',
    EPListarClientes: 'api/customer',
    EPActualizarClienteTelefono: 'api/customer/phone',

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

    
    
    
    EPListarUsuarios: 'api/user',
};
