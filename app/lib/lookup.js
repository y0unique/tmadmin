// ── Lookup maps ───────────────────────────────────────────────────────────────
// Integer → Label (for display, export)
// Label   → Integer (for import, saving)

export const TYPE = {
  0: 'N/A', 1: 'Funko', 2: 'Disposable',
};

export const CATEGORY = {
  0: 'N/A', 1: 'ANIMATION', 2: 'GAMES', 3: 'MOVIES',
  4: 'NONE', 5: 'STAGES', 6: 'ROCKS', 7: 'FOOTBALL',
  8: 'PROTECTOR', 9: 'TELEVISION', 10: 'COMIC COVER', 11: 'RACING',
};

export const QUALITY = {
  0: 'N/A', 1: "Collector's Grade", 2: 'Standard Grade',
  3: 'Substandard Grade', 4: 'Damaged Grade',
};

export const SIZE = {
  0: 'N/A', 1: 'REGULAR 4"', 2: 'SUPER 6"', 3: 'JUMBO 10"',
  4: 'PLUS', 5: 'DELUXE', 6: 'MOMENT', 7: 'BITTY',
  8: 'KEYCHAIN', 9: '2PACK', 10: 'COVER', 11: 'PREMIUM', 12: 'POSTER',
};

export const STICKER = {
  0: 'N/A', 1: 'SPECIAL', 2: 'NONE', 3: 'BIG APPLE',
  4: 'FUNIMATION', 5: 'SHARED', 6: 'HOTTOPIC', 7: 'EE',
  8: 'AAA', 9: 'BOXLUNCH', 10: 'CHALICE', 11: 'FUNKO', 12: 'CRUNCHY ROLL',
};

// ── Reverse maps (Label → Integer) ───────────────────────────────────────────
function reverse(map) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v.toUpperCase(), parseInt(k)]));
}

export const TYPE_REV     = reverse(TYPE);
export const CATEGORY_REV = reverse(CATEGORY);
export const QUALITY_REV  = reverse(QUALITY);
export const SIZE_REV     = reverse(SIZE);
export const STICKER_REV  = reverse(STICKER);

// ── Decode helpers (int → label) ─────────────────────────────────────────────
export const decodeType     = (v) => TYPE[v]     ?? 'N/A';
export const decodeCategory = (v) => CATEGORY[v] ?? 'N/A';
export const decodeQuality  = (v) => QUALITY[v]  ?? 'N/A';
export const decodeSize     = (v) => SIZE[v]      ?? 'N/A';
export const decodeSticker  = (v) => STICKER[v]  ?? 'N/A';

// ── Encode helpers (label or int → int) ──────────────────────────────────────
function encode(val, reverseMap, maxVal) {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseInt(val);
  if (!isNaN(num)) return num >= 0 && num <= maxVal ? num : 0;
  return reverseMap[String(val).trim().toUpperCase()] ?? 0;
}

export const encodeType     = (v) => encode(v, TYPE_REV,     2);
export const encodeCategory = (v) => encode(v, CATEGORY_REV, 11);
export const encodeQuality  = (v) => encode(v, QUALITY_REV,  4);
export const encodeSize     = (v) => encode(v, SIZE_REV,     12);
export const encodeSticker  = (v) => encode(v, STICKER_REV,  12);

// ── Dropdown option arrays (for selects) ─────────────────────────────────────
export const TYPE_OPTIONS     = Object.entries(TYPE).map(([v, l])     => ({ value: parseInt(v), label: l }));
export const CATEGORY_OPTIONS = Object.entries(CATEGORY).map(([v, l]) => ({ value: parseInt(v), label: l }));
export const QUALITY_OPTIONS  = Object.entries(QUALITY).map(([v, l])  => ({ value: parseInt(v), label: l }));
export const SIZE_OPTIONS     = Object.entries(SIZE).map(([v, l])     => ({ value: parseInt(v), label: l }));
export const STICKER_OPTIONS  = Object.entries(STICKER).map(([v, l])  => ({ value: parseInt(v), label: l }));

// ── Validate dropdown value ───────────────────────────────────────────────────
export const validType     = (v) => Object.keys(TYPE).map(Number).includes(Number(v));
export const validCategory = (v) => Object.keys(CATEGORY).map(Number).includes(Number(v));
export const validQuality  = (v) => Object.keys(QUALITY).map(Number).includes(Number(v));
export const validSize     = (v) => Object.keys(SIZE).map(Number).includes(Number(v));
export const validSticker  = (v) => Object.keys(STICKER).map(Number).includes(Number(v));
