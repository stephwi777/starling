// LAYOUTS

export const LAYOUTS = {
  1: {
    desktop: [
      { shape: 'wide', moon: { right: 10, top: 16 }, w: 22, shade: 1 },
      { shape: 'hump', x: 10, y: 47, w: 17, shade: 2, flip: true },
    ],
    phone: [
      { shape: 'wide', moon: { right: 46, top: 2 }, w: 40, shade: 6 },
      { shape: 'hump', x: 4, y: 20, w: 36, shade: 5, flip: true },
    ],
  },
  2: {
    desktop: [
      { shape: 'hump', x: 5, y: 3, w: 36, shade: 0 },
      { shape: 'wide', moon: { right: -64, top: -16 }, w: 34, shade: 1 },
      { shape: 'long', x: -1, y: 31, w: 35, shade: 2, flip: true },
      { shape: 'small', x: 78, y: 42, w: 25, shade: 3 },
    ],
    phone: [
      { shape: 'wide', x: 34, y: 2, w: 70, shade: 0 },
      { shape: 'hump', x: 54, y: 15, w: 50, shade: 1 },
      { shape: 'small', x: 22, y: 20, w: 30, shade: 1 },
      { shape: 'long', x: -16, y: 62, w: 58, shade: 2, flip: true },
    ],
  },
  3: {
    canvas: [
      { shape: 'tall', x: -12, y: 11, w: 64, shade: 1 },
      { shape: 'wide', x: 42, y: 6, w: 70, shade: 1, flip: true },
      { shape: 'long', x: -6, y: 25, w: 66, shade: 2, flip: true },
      { shape: 'hump', x: 52, y: 24, w: 58, shade: 2 },
    ],
  },
}
