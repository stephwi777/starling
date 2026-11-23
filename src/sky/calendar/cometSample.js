// SAMPLE COMETS

const LEMMON_PATH = { q: 0.529802, e: 0.995603, peri: 132.9557, node: 108.1002, incl: 143.6634, G: 4 }
const HARTLEY_PATH = { q: 1.265109, e: 0.836166, peri: 47.0653, node: 1.4737, incl: 95.7922, G: 6 }

export const SAMPLE_COMETS = [
  { id: 'SAMPLE1', designation: 'C/2027 S1', name: 'Starling', perihelion: new Date('2027-11-08T12:26:30Z'), ...LEMMON_PATH, H: 8.6 },
  { id: 'SAMPLE2', designation: 'C/2027 S2', name: 'Finch', perihelion: new Date('2027-11-08T12:26:30Z'), ...LEMMON_PATH, H: 10.2 },
  { id: 'SAMPLE3', designation: 'P/2026 S3', name: 'Wren', perihelion: new Date('2026-11-27T04:16:54Z'), ...HARTLEY_PATH, H: 8.4 },
  { id: 'SAMPLE4', designation: 'C/2027 S4', name: 'Southwind', perihelion: new Date('2027-03-01T00:00:00Z'), q: 3, e: 0.9, peri: 270, node: 0, incl: 90, H: 0, G: 4 },
]
