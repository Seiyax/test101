export type LayoutKey = 'square' | 'wide' | 'story' | 'portrait' | 'tall';

export interface LayoutConfig {
  label: string;
  w: number;
  h: number;
  radius: number;
  pad: number;
  cover: number;
  coverR: number;
  headGap: number;
  logo: number;
  wordmark: number;
  logoGap: number;
  lyricGap: number;
  lyricMin: number;
  lyricMax: number;
  lyricMiddle: boolean;
  titleSize: number;
  titleLine: number;
  artistSize: number;
  artistLine: number;
  preview: [number, number, number];
}

export type ThemeKey =
  | 'classic'
  | 'brutalism'
  | 'cyberpunk'
  | 'glass'
  | 'clay'
  | 'neumorphism'
  | 'vinyl'
  | 'ticket'
  | 'polaroid'
  | 'y2k'
  | 'aurora'
  | 'pixel'
  | 'notebook'
  | 'newspaper'
  | 'sticker'
  | 'holo'
  | 'wrapped'
  | 'cassette'
  | 'receipt'
  | 'gameboy'
  | 'stained'
  | 'neon'
  | 'comic'
  | 'pixelart'
  | 'chalkboard'
  | 'glowsketch'
  | 'ps2'
  | 'comicart'
  | 'flatvector'
  | 'dankoe'
  | 'cgimotion'
  | 'lego'
  | 'zackd'
  | 'cdcase'
  | 'minidisc'
  | 'floppy'
  | 'plaque'
  | 'vhs'
  | 'stamp'
  | 'filmstrip'
  | 'vippass'
  | 'boarding'
  | 'matchbook'
  | 'manga'
  | 'risograph'
  | 'waxseal'
  | 'blueprint'
  | 'tarot'
  | 'ipod'
  | 'terminal'
  | 'aqua'
  | 'frutiger'
  | 'swiss';

export interface ThemeConfig {
  label: string;
  desc: string;
  icon: string;
}

export type ExportFormat = 'png' | 'jpg' | 'webp';

export interface ExportPreset {
  id: string;
  label: string;
  w: number;
  h: number;
  layout: LayoutKey;
}

export type CoverShape = 'auto' | 'square' | 'rounded' | 'circle' | 'hidden';

export type LyricFontId = 'auto' | 'poppins' | 'serif' | 'hand' | 'condensed' | 'bold' | 'mono';

export type TextAlign = 'left' | 'center' | 'right';

export type BgStyle = 'none' | 'blur' | 'gradient' | 'pattern';

export type GlareStyle = 'auto' | 'diagonal' | 'spotlight' | 'follow' | 'holo' | 'gloss' | 'sweep' | 'none';

export interface ElementVisibility {
  cover: boolean;
  title: boolean;
  artist: boolean;
  logo: boolean;
  bar: boolean;
  code: boolean;
}

export interface TiltState {
  rx: number;
  ry: number;
  rz: number;
  perspective: number;
}

export interface CardState {
  title: string;
  artist: string;
  lyrics: string;
  coverUrl: string;
  color: string;
  theme: ThemeKey;
  layoutKey: LayoutKey;
  coverShape: CoverShape;
  lyricFont: LyricFontId;
  align: TextAlign;
  hlLine: number;
  bgStyle: BgStyle;
  glareStyle: GlareStyle;
  glare: number;
  glareAuto: boolean;
  cardDepth: number;
  autoFit: boolean;
  lyricSize: number;
  transparent: boolean;
  scale: number;
  fmt: ExportFormat;
  autoColor: boolean;
  hide: ElementVisibility;
  trackId: string | null;
  preset: string | null;
}

export interface SearchResult {
  thumb: string;
  cover: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string | null;
}

export interface SavedLook {
  name: string;
  look: {
    t: ThemeKey;
    c: string;
    g: string;
    gi: number;
    l: LayoutKey;
    cs: string;
    lf: string;
    bg: BgStyle;
    d: number;
    a: TextAlign;
    ac: boolean;
    ti?: string;
    ar?: string;
    ly?: string;
    cu?: string;
  };
}

export interface HistorySnapshot {
  color: string;
  theme: ThemeKey;
  title: string;
  artist: string;
  lyrics: string;
  layoutKey: LayoutKey;
}
