/**
 * Compresión de fotos en el navegador antes de subirlas.
 *
 * Las fotos de la cámara de una tablet/celular suelen pesar 3-8 MB. Para evidencias de prendas y
 * zapatillas basta con ~1600 px de lado: se reduce la imagen y se re-codifica como JPEG, quedando en
 * ~300-500 KB. Esto acelera la subida y también la posterior visualización (las fotos se descargan
 * completas para verlas).
 *
 * Nunca bloquea la subida: ante cualquier error, o si el resultado no es más liviano que el original,
 * se devuelve el archivo original.
 */

export interface OpcionesCompresionImagen {
  /** Lado mayor máximo en píxeles. Por defecto 1600. */
  maxLado?: number;
  /** Calidad JPEG entre 0 y 1. Por defecto 0.8. */
  calidad?: number;
  /** Si la imagen ya cumple el tamaño y pesa menos que esto (bytes), no se toca. Por defecto 500 KB. */
  omitirSiMenorA?: number;
}

const TIPOS_COMPRIMIBLES = ['image/jpeg', 'image/png', 'image/webp'];

export async function comprimirImagen(file: File, opciones: OpcionesCompresionImagen = {}): Promise<File> {
  const maxLado = opciones.maxLado ?? 1600;
  const calidad = opciones.calidad ?? 0.8;
  const omitirSiMenorA = opciones.omitirSiMenorA ?? 500 * 1024;

  if (!TIPOS_COMPRIMIBLES.includes(file.type)) {
    return file;
  }

  let fuente: ImageBitmap | HTMLImageElement | null = null;
  try {
    fuente = await decodificar(file);
    const ancho = fuente.width;
    const alto = fuente.height;
    if (!ancho || !alto) {
      return file;
    }

    const escala = Math.min(1, maxLado / Math.max(ancho, alto));
    if (escala === 1 && file.size <= omitirSiMenorA) {
      return file; // ya es liviana: no vale la pena re-codificar
    }

    const destinoAncho = Math.round(ancho * escala);
    const destinoAlto = Math.round(alto * escala);

    const canvas = document.createElement('canvas');
    canvas.width = destinoAncho;
    canvas.height = destinoAlto;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }

    // Fondo blanco: un PNG con transparencia convertido a JPEG quedaría con fondo negro.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, destinoAncho, destinoAlto);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(fuente, 0, 0, destinoAncho, destinoAlto);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', calidad));
    // Libera la memoria del canvas de inmediato (importante en tablets con poca RAM).
    canvas.width = 0;
    canvas.height = 0;

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], renombrarComoJpg(file.name), { type: 'image/jpeg', lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    if (fuente && 'close' in fuente) {
      fuente.close();
    }
  }
}

/**
 * Decodifica la imagen respetando la orientación EXIF (las fotos verticales de cámara vienen
 * "acostadas" con una marca de rotación). createImageBitmap con imageOrientation 'from-image' la aplica;
 * si el navegador no lo soporta, se usa un <img>, que en navegadores actuales también la respeta.
 */
async function decodificar(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // continúa con el respaldo <img>
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renombrarComoJpg(nombre: string): string {
  const base = nombre.replace(/\.[^./\\]+$/, '');
  return `${base || 'foto'}.jpg`;
}
