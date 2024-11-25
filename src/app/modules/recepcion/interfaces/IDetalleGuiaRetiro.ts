export interface IDetalleGuiaRetiro {
    codProd: string;
    nomProd: string;
    cant: number;
    precio: number;
    subtotal: number;
    obs: string;
    estado: string;
    fechaEntrega: string;
    ubicacion: string;
}


export interface IGuiaRetiro {
    id:number,
    serieGuia: string;
    numeroGuia: string;
    fechaOperacion: string;
    fechaHoraEntrega: string;
    mensajeAlertas: string;
    observaciones: string;
    tipoPago: string;
    descripcionPago: string;
    tipoRecepcion: string;
    direccionContacto: string;
    telefonoContacto: string;
    total: number;
    acuenta: number;
    saldo: number;
    customerId: number;
    customerName: string;
    customerPhone: string;
    estadoPago: string;
    fechaPago: string;    
    estadoRegistro: string;
    estadoSituacion: string;
    fechaRecojo: string;    
    tipoPagoCancelacion: string;
    workGuideDetailsDTO: IGuiaRetiroWgdDTO[];
}

export interface IGuiaRetiroWgdDTO {
    id: number;
    cant: number;
    precio: number;
    total: number;
    observaciones: string;
    tipoLavado: string;
    ubicacion: string;
    estadoTrabajo: string;
    productId: number;
    product: IGuiaRetiroWgdDTOProduct;
    estadoRegistro: string;
    estadoSituacion: string;
    estadoPago: string;    
    fechaRecojo: string;
    fechaDevolucion: string;
    identificador: string;
}

interface IGuiaRetiroWgdDTOProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
    catServiceId: number;
}