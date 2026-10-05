export interface IColorPrenda {
  nombre: string;
  valor: string;
}

/**
 * Paleta "original": los mismos 12 colores que ya tenian dialog-edit-item y
 * dialog-zapatilla-item desde su primer commit. La usan los modales que
 * siguen usando recepcion-emision (de escritorio), donde una paleta mas
 * grande hace crecer demasiado el modal.
 */
export const COLORES_PRENDA: IColorPrenda[] = [
  { nombre: 'Blanco', valor: '#FFFFFF' },
  { nombre: 'Negro', valor: '#000000' },
  { nombre: 'Azul', valor: '#0000FF' },
  { nombre: 'Celeste', valor: '#87CEEB' },
  { nombre: 'Amarillo', valor: '#FFFF00' },
  { nombre: 'Rosado', valor: '#FFC0CB' },
  { nombre: 'Morado', valor: '#800080' },
  { nombre: 'Beig', valor: '#F5F5DC' },
  { nombre: 'Marron', valor: '#A52A2A' },
  { nombre: 'Acero', valor: '#B0C4DE' },
  { nombre: 'Rojo', valor: '#FF0000' },
  { nombre: 'Verde', valor: 'green' },
];

/**
 * Paleta ampliada para los modales touch: los mismos 12 de siempre mas los
 * colores que se sumaron en la propuesta de diseno (Naranja, Guinda). Los
 * modales touch tienen mas espacio y las filas de swatches ya envuelven en
 * varias lineas, asi que una paleta mas grande no es un problema ahi.
 */
export const COLORES_PRENDA_TOUCH: IColorPrenda[] = [
  ...COLORES_PRENDA,
  { nombre: 'Naranja', valor: '#E8641C' },
  { nombre: 'Guinda', valor: '#7A1F3D' },
];
