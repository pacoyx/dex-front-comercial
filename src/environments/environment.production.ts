export const environment = {
    apiUrlBase: 'http://64.23.253.167:8080/',
    apiUrlBaseAzure: 'https://back-comercial-dexter24-cbhbfpagcpckefb2.canadacentral-01.azurewebsites.net/',
    EPlogin: 'api/login',
    EPRefreshToken: 'api/refresh-token',
    // apiUrlBase: 'http://64.23.253.167:8080/', // produccion docker DigOcean

    // Mi Cuenta (perfil del usuario logueado)
    EPUserMe: 'api/user/me',
    EPUserMePassword: 'api/user/me/password',
    EPUserMePhoto: 'api/user/me/photo',
    EPUserMeDocuments: 'api/user/me/documents',
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
    EPReimprimirGuia: 'api/workGuideMain', // POST {id}/reprint
    
    EPListarGastosPorUsuario: 'api/expenseBox/byUser',
    EPListarGastosPorFecha: 'api/expenseBox/byDate',
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
    EPAsignarUbicacionDetalle: 'api/locationclothes/workguide-details', // /{workGuideDetailId}/assign
    EPObtenerCajasPorFecha: 'api/cashBox/resumeAllUser',
    
    EPDividirPago: 'api/cashBox/splitPayCash',
    EPListarServiciosAccesoRapido: 'api/prodService/getServicesQuickAccess',
    EPdashboardcash: 'api/reports/dashboardcash',
    EPdashboardcashSemana: 'api/reports/dashboardcash/week',
    EPdashboardcashMes: 'api/reports/dashboardcash/month',
    
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
    EPCompanyLogo: 'api/company', // /{id}/logo

    //Tickets
    EPGetClothingWorkerById:'api/clothingWorker/findById',
    EPCreateTicket: 'api/ticket',

    //sucursales
    EPListarSucursales: 'api/branchSales',
    EPCrearSucursal: 'api/branchSales',
    EPActualizarSucursal: 'api/branchSales',
    EPEliminarSucursal: 'api/branchSales',

    //usuarios por sucursal
    EPListarSucursalUsuariosPorSucursal: 'api/brachSalesUser/byBranch',
    EPCrearSucursalUsuario: 'api/brachSalesUser',
    EPActualizarSucursalUsuario: 'api/brachSalesUser',
    EPEliminarSucursalUsuario: 'api/brachSalesUser',

    //impresoras
    EPListarImpresoras: 'api/printer',
    EPCrearImpresora: 'api/printer',
    EPActualizarImpresora: 'api/printer',
    EPEliminarImpresora: 'api/printer',

    //worker nodes
    EPListarWorkerNodes: 'api/workerNode',
    EPCrearWorkerNode: 'api/workerNode',
    EPActualizarWorkerNode: 'api/workerNode',
    EPEliminarWorkerNode: 'api/workerNode',

    //dashboard printers
    EPPrintingStatus: 'api/admin/printing/status',

    //impresiones pendientes
    EPListarImpresionesPendientes: 'api/admin/print-queues/pending',
    EPCancelarImpresionPendiente: 'api/admin/print-queues',
    EPReimprimirImpresionPendiente: 'api/admin/print-queues',

     // proveedores
     EPListarProveedores: 'api/supplier',
     EPCrearProveedor: 'api/supplier',
     EPListarProveedoresPaginator: 'api/supplier/search/paginator',
     EPActualizarProveedor: 'api/supplier',
     EPListarProveedoresPorPatron: 'api/supplier/search/byPatron',

     // productos
    EPListarProductos: 'api/product',
    EPCrearProducto: 'api/product',
    EPListarProductosPaginator: 'api/product/search/paginator',
    EPActualizarProducto: 'api/product',
    EPListarProductosPorPatron: 'api/product/search/byPatron',

    //unidad de medida
    EPListarUnidadMedidaShort: 'api/unitMeasurement/short',
    EPListarUnidadesMedida: 'api/unitMeasurement',
    EPCrearUnidadMedida: 'api/unitMeasurement',
    EPActualizarUnidadMedida: 'api/unitMeasurement',
    EPEliminarUnidadMedida: 'api/unitMeasurement',


    //cateogoria producto
    EPListarCategoriaProductoShort: 'api/categoryProd/short',
    EPListarCategoriasProducto: 'api/categoryProd',
    EPCrearCategoriaProducto: 'api/categoryProd',
    EPActualizarCategoriaProducto: 'api/categoryProd',
    EPEliminarCategoriaProducto: 'api/categoryProd',

    // Invoice
    EPListarInvoice: 'api/purchase-invoice',
    EPCrearInvoice: 'api/purchase-invoice',

    // reportes
    EPFacturasPorMes: 'api/purchase/reports/byMonth',
    EPFacturasPorFechas: 'api/purchase/reports/byDate',
    EPFacturasPorProveedor: 'api/purchase/reports/bySupplier',
    EPFacturasPorProducto: 'api/purchase/reports/byProduct',
    EPPurchaseRegisterReport: 'api/reports/purchase-register',
    EPPurchaseRegisterReportPdf: 'api/reports/purchase-register/pdf',
    EPPurchaseRegisterReportExcel: 'api/reports/purchase-register/excel',

    // cuentas por pagar y dashboard de compras
    EPAccountsPayable: 'api/accounts-payable',
    EPPurchaseDashboard: 'api/purchase-dashboard',

    // FACTURACION

    EPTypeDocuments: 'api/type-documents',
    EPPaymentMethods: 'api/payment-methods',
    EPSalesInvoices: 'api/invoices',
    EPAccountsReceivable: 'api/accounts-receivable',
    EPCollectionSheets: 'api/collection-sheets',
    EPBuscarClientesPorPatron: 'api/customer/search/byPatron',

    // Customer Empresa: perfil de facturacion, contactos, busqueda y resumen de cuenta
    EPCustomersBase: 'api/customers',
    EPCustomerContactItem: 'api/customer-contacts',
    EPCustomerCompanySearch: 'api/customers/company-search',

    // reportes facturacion
    EPSalesRegisterReport: 'api/reports/sales-register',
    EPSalesRegisterReportPdf: 'api/reports/sales-register/pdf',
    EPSalesRegisterReportExcel: 'api/reports/sales-register/excel',

    // reporte valorizacion mensual
    EPValuationReport: 'api/invoices/valuation-report',
    EPValuationReportPhotosPdf: 'api/invoices/valuation-report/photos-pdf',
    EPValuationReportSummaryPdf: 'api/invoices/valuation-report/summary-pdf',
    EPValuationReportSummaryExcel: 'api/invoices/valuation-report/summary-excel',

    // dashboard facturacion
    EPInvoiceDashboard: 'api/invoice-dashboard',

    // Inspección / Zapatillas
    EPSneakerBrands: 'api/sneaker-brands',
    EPWorkGuideDetails: 'api/workguide-details',
    EPInspections: 'api/inspections',
    EPWorkGuides: 'api/workguides',
    EPReporteSneakers: 'api/reports/sneakers',

    // RRHH - Recursos Humanos y Planillas
    EPHrAreas: 'api/hr/areas',
    EPHrPositions: 'api/hr/positions',
    EPHrDocumentTypes: 'api/hr/document-types',
    EPEmployees: 'api/employees',
    EPAttendance: 'api/attendance',
    EPAttendanceIncidents: 'api/attendance/incidents',
    EPExtraHours: 'api/extra-hours',
    EPLoans: 'api/loans',
    EPPayrollPeriods: 'api/payroll-periods',
    EPHrDashboard: 'api/hr-dashboard',
    EPHrReports: 'api/hr/reports',

    // GASTOS (Expenses) - gastos administrativos/generales, distinto de ExpenseBox/Caja Chica
    EPExpenseCategories: 'api/expense-categories',
    EPExpenses: 'api/expenses',
    EPExpenseDashboard: 'api/expense-dashboard',
    EPExpenseReports: 'api/expense-reports',

    // RBAC - Roles y Permisos
    EPAuthMe: 'api/auth/me',
    EPRoles: 'api/roles',
    EPPermissions: 'api/permissions',
    EPUsersRoles: 'api/users', // OJO: plural, distinto de EPGetUsers ('api/user')

    // Operaciones Corporativas - Guias de Recojo
    EPPickupGuides: 'api/pickup-guides',

    // Operaciones Corporativas - Vehiculos
    EPVehicles: 'api/vehicles',

    // Tarifas por Cliente (CustomerPriceList)
    EPPriceLists: 'api/price-lists', // /{id}, /{id}/clone, /{id}/activate, /{id}/deactivate
    // EPCustomersBase ('api/customers') ya existe: se usa para /{id}/price-lists y /{id}/price-lists/active

    // Portal Cliente (administracion desde Backoffice)
    EPCustomerPortalAdmin: 'api/customer-portal-admin', // /customers

    // Reseteo de contraseña de usuarios del Portal Cliente (desde backoffice/facturacion)
    EPCustomerUsersAdmin: 'api/corporate-operations/customer-users', // /{id}/reset-password
    // portal-enable, portal-status, portal-admin/regenerate-activation-link cuelgan de EPCustomersBase

    // Cuentas de Correo (credenciales SMTP por Operacion)
    EPEmailAccounts: 'api/email-accounts',

    // Bancos y Cuentas Bancarias de la Empresa
    EPBanks: 'api/banks',
    EPBankAccountTypes: 'api/bank-account-types',
    EPCompanies: 'api/companies', // base para /{companyId}/bank-accounts

    // Historial de prendas frecuentes por cliente (ventana flotante en recepcion-emision)
    EPCustomerGarmentHistory: 'api/customerGarmentHistory', // GET /{customerId}?search=..., DELETE /{id}

    // Correos Programados (Hangfire) - management/Configuraciones
    EPScheduledEmailNotifications: 'api/scheduled-email-notifications',

    // Recordatorios de Facturas Vencidas (segunda fase de Correos Programados)
    EPInvoiceReminders: 'api/invoice-reminders', // /execute, /preview/{customerId}, /send-test, /logs
    // EPSalesInvoices ('api/invoices') se reusa para /{id}/reminder-suppression
    // EPCustomersBase ('api/customers') se reusa para /{id}/billing-profile/reminders

    // Dashboard ejecutivo de Management (agrega datos de todos los modulos)
    EPManagementDashboard: 'api/management-dashboard',
};
