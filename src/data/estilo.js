/* ============================================================
   ENCUENTRA TU ESTILO — datos del módulo
   Visagismo interactivo + galería de estilos · Brunetti
   Imágenes de muestra (Unsplash) listas para reemplazar por
   fotos reales del estudio. Cada una degrada a un placeholder
   con etiqueta si no carga (ver SmartImg).
   ============================================================ */

// helper de URL de muestra (Unsplash)
export const u = (id, w) =>
  `https://images.unsplash.com/photo-${id}?w=${w || 900}&q=80&auto=format&fit=crop`

// ---- FORMAS DE ROSTRO (paso 1 del workflow) ----
// path = silueta SVG simple dentro de viewBox 0 0 100 120
export const FACE_SHAPES = [
  {
    id: 'ovalado',
    name: 'Ovalado',
    tagline: 'El equilibrio natural',
    path: 'M50 6 C72 6 84 30 84 60 C84 92 70 114 50 114 C30 114 16 92 16 60 C16 30 28 6 50 6 Z',
    traits: ['Frente y mandíbula proporcionadas', 'Largo mayor que el ancho', 'Líneas suaves'],
    diagnosis:
      'El rostro más versátil. Las proporciones ya están equilibradas, así que casi cualquier corte funciona — el objetivo es resaltar tu estilo, no corregir.',
    goal: 'Mantener la armonía y jugar con la personalidad.',
    best: [
      { name: 'Texturizado medio', img: u('1567894340315-735d7c361db0'), note: 'Movimiento natural sin perder estructura.' },
      { name: 'Fade clásico', img: u('1599351431202-1e0f0137899a'), note: 'Limpio en los lados, definido arriba.' },
      { name: 'Pompadour suave', img: u('1583864697784-a0efc8379f70'), note: 'Volumen frontal para un aire elegante.' },
    ],
    avoid: 'Flequillos muy pesados que tapen la frente y rompan la proporción.',
  },
  {
    id: 'redondo',
    name: 'Redondo',
    tagline: 'Suavidad que pide ángulos',
    path: 'M50 8 C76 8 90 30 90 60 C90 90 76 112 50 112 C24 112 10 90 10 60 C10 30 24 8 50 8 Z',
    traits: ['Ancho y largo similares', 'Mejillas llenas', 'Mandíbula redondeada'],
    diagnosis:
      'Buscamos crear altura y ángulos para estilizar el rostro. Volumen arriba y lados más cerrados alargan visualmente la cara.',
    goal: 'Añadir altura y definición vertical.',
    best: [
      { name: 'Pompadour / Quiff', img: u('1583864697784-a0efc8379f70'), note: 'Altura arriba que estiliza el conjunto.' },
      { name: 'Undercut con volumen', img: u('1622286342621-4bd786c2447c'), note: 'Contraste marcado lados-tope.' },
      { name: 'Fade alto', img: u('1599351431202-1e0f0137899a'), note: 'Cierra los lados y sube la mirada.' },
    ],
    avoid: 'Cortes redondeados y volumen a los costados — ensanchan aún más.',
  },
  {
    id: 'cuadrado',
    name: 'Cuadrado',
    tagline: 'Mandíbula de carácter',
    path: 'M22 10 L78 10 Q86 10 86 22 L86 92 Q86 112 66 112 L34 112 Q14 112 14 92 L14 22 Q14 10 22 10 Z',
    traits: ['Mandíbula marcada y ancha', 'Frente angular', 'Líneas fuertes'],
    diagnosis:
      'Una estructura fuerte que admite cortes potentes. Podemos exaltar la mandíbula o suavizarla según el resultado que busques.',
    goal: 'Resaltar la fuerza o equilibrar con textura.',
    best: [
      { name: 'Crop texturizado', img: u('1567894340315-735d7c361db0'), note: 'Textura arriba que moderna la estructura.' },
      { name: 'Buzz / corte corto', img: u('1622286342621-4bd786c2447c'), note: 'Limpio, deja hablar a la mandíbula.' },
      { name: 'Fade + barba definida', img: u('1596728325488-58c87691e9af'), note: 'Combo de carácter, muy fotogénico.' },
    ],
    avoid: 'Volúmenes extremos que exageren demasiado la angulosidad.',
  },
  {
    id: 'alargado',
    name: 'Alargado',
    tagline: 'Vertical y elegante',
    path: 'M50 6 C70 6 80 26 80 56 C80 96 68 116 50 116 C32 116 20 96 20 56 C20 26 30 6 50 6 Z',
    traits: ['Rostro más largo que ancho', 'Frente alta', 'Mentón alargado'],
    diagnosis:
      'El objetivo es acortar visualmente el rostro: menos altura arriba y algo de volumen a los lados crean equilibrio.',
    goal: 'Restar largo y sumar ancho.',
    best: [
      { name: 'Flequillo / French crop', img: u('1567894340315-735d7c361db0'), note: 'Baja la frente y acorta el rostro.' },
      { name: 'Lados con cuerpo', img: u('1605497788044-5a32c7078486'), note: 'Algo de volumen lateral para ensanchar.' },
      { name: 'Barba media', img: u('1517832606299-7ae9b720a186'), note: 'Da peso al tercio inferior.' },
    ],
    avoid: 'Mucho volumen arriba y lados rapados al cero — alargan más.',
  },
  {
    id: 'triangular',
    name: 'Triangular',
    tagline: 'Base fuerte, frente fina',
    path: 'M50 8 C62 8 70 22 72 40 L86 104 Q88 112 78 112 L22 112 Q12 112 14 104 L28 40 C30 22 38 8 50 8 Z',
    traits: ['Mandíbula ancha', 'Frente más estrecha', 'Pómulos discretos'],
    diagnosis:
      'Compensamos llevando volumen y amplitud a la zona superior, para equilibrar una mandíbula más ancha que la frente.',
    goal: 'Sumar volumen en la parte alta.',
    best: [
      { name: 'Volumen arriba', img: u('1583864697784-a0efc8379f70'), note: 'Ensancha la frente ópticamente.' },
      { name: 'Pompadour', img: u('1599351431202-1e0f0137899a'), note: 'Altura y cuerpo en el tope.' },
      { name: 'Lados moderados', img: u('1605497788044-5a32c7078486'), note: 'Ni muy abiertos ni rapados.' },
    ],
    avoid: 'Lados muy voluminosos que ensanchen aún más la mandíbula.',
  },
  {
    id: 'diamante',
    name: 'Diamante',
    tagline: 'Pómulos protagonistas',
    path: 'M50 6 L74 38 C82 50 82 62 72 78 L54 110 Q50 116 46 110 L28 78 C18 62 18 50 26 38 Z',
    traits: ['Pómulos anchos', 'Frente y mentón más estrechos', 'Rasgos definidos'],
    diagnosis:
      'Aprovechamos los pómulos marcados. Damos amplitud a frente y mentón para equilibrar el centro más ancho.',
    goal: 'Ensanchar frente y mentón.',
    best: [
      { name: 'Flequillo texturizado', img: u('1567894340315-735d7c361db0'), note: 'Suma ancho en la frente.' },
      { name: 'Volumen frontal', img: u('1583864697784-a0efc8379f70'), note: 'Equilibra el tercio superior.' },
      { name: 'Barba en la mandíbula', img: u('1596728325488-58c87691e9af'), note: 'Da peso y ancho al mentón.' },
    ],
    avoid: 'Lados rapados al extremo que estrechen el rostro.',
  },
]

// ---- GALERÍA por tipo de corte ----
export const GALLERY_CATS = ['Todos', 'Fade', 'Texturizado', 'Clásico', 'Largo', 'Barba']
export const GALLERY = [
  { cat: 'Fade', title: 'Skin fade', sub: 'Degradado al cero', img: u('1599351431202-1e0f0137899a') },
  { cat: 'Fade', title: 'Mid fade + diseño', sub: 'Línea marcada', img: u('1622286342621-4bd786c2447c') },
  { cat: 'Texturizado', title: 'Crop texturizado', sub: 'Movimiento natural', img: u('1567894340315-735d7c361db0') },
  { cat: 'Clásico', title: 'Side part', sub: 'Elegancia atemporal', img: u('1583864697784-a0efc8379f70') },
  { cat: 'Barba', title: 'Perfilado de barba', sub: 'Contorno definido', img: u('1596728325488-58c87691e9af') },
  { cat: 'Fade', title: 'Taper en la nuca', sub: 'Acabado limpio', img: u('1605497788044-5a32c7078486') },
  { cat: 'Barba', title: 'Afeitado a navaja', sub: 'Ritual clásico', img: u('1503951914875-452162b0f3f1') },
  { cat: 'Clásico', title: 'Corte ejecutivo', sub: 'Pulcro y prolijo', img: u('1512690459411-b9245aed614b') },
  { cat: 'Largo', title: 'Largo con textura', sub: 'Caída con cuerpo', img: u('1633332755192-727a05c4013d') },
  { cat: 'Barba', title: 'Barba escultural', sub: 'Trabajo de detalle', img: u('1517832606299-7ae9b720a186') },
  { cat: 'Texturizado', title: 'Quiff texturizado', sub: 'Volumen direccional', img: u('1582095133179-bfd08e2fc6b3') },
  { cat: 'Clásico', title: 'El estudio', sub: 'Ambiente Brunetti', img: u('1599566150163-29194dcaad36') },
]
