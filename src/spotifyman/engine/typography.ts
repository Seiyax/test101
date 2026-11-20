import type { CardState, LayoutConfig, ThemeKey, TiltState } from '../types';
import {
  CHILD_DEPTH_RATIO,
  FONT,
  LYRIC_FONTS,
  THEME_FONT,
} from './constants';
import type { CardPalette } from './signatureThemes';
import type { PlaybackVisualState } from './canvasRenderer';
import { barSpace, cardFrame, footerSpace, getLayers } from './geometry';

let fontGen = 0;
export const incrementFontGen = () => fontGen++;

const wordWidths = new Map<string, number>();

export function wordWidth(
  g: CanvasRenderingContext2D,
  word: string,
  size: number,
  fontFamily: string,
  weight: number | string,
  k: number
): number {
  const key = `${fontGen}|${fontFamily}|${weight}|${size}|${k}|${word}`;
  let w = wordWidths.get(key);
  if (w === undefined) {
    w = g.measureText(word).width;
    if (wordWidths.size > 8000) wordWidths.clear();
    wordWidths.set(key, w);
  }
  return w;
}

const parsedLyricsCache = new Map<string, (string[] | null)[]>();

export function parseLyrics(text: string): (string[] | null)[] {
  const cached = parsedLyricsCache.get(text);
  if (cached) return cached;
  const paras = text.split('\n').map((raw) => {
    const t = raw.trim();
    return t ? t.split(/\s+/) : null;
  });
  while (paras.length && paras[0] === null) paras.shift();
  while (paras.length && paras[paras.length - 1] === null) paras.pop();
  if (parsedLyricsCache.size > 40) parsedLyricsCache.clear();
  parsedLyricsCache.set(text, paras);
  return paras;
}

export function letterSpacing(g: CanvasRenderingContext2D, px: number) {
  if ('letterSpacing' in g) {
    (g as any).letterSpacing = px + 'px';
  }
}

export function wrapLine(
  g: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (g.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  return lines;
}

export function ellipsize(
  g: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (g.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && g.measureText(trimmed + '…').width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed.trimEnd() + '…';
}

function headerFontFor(theme: ThemeKey): {
  titleFamily: string;
  artistFamily: string;
  titleWeight: number;
  artistWeight: number;
  scale: number;
  tracking: number;
} {
  switch (theme) {
    case 'pixelart':
      return {
        titleFamily: LYRIC_FONTS.pixel.family,
        artistFamily: LYRIC_FONTS.pixel.family,
        titleWeight: 400,
        artistWeight: 400,
        scale: 0.56,
        tracking: 0,
      };
    case 'chalkboard':
      return {
        titleFamily: LYRIC_FONTS.chalk.family,
        artistFamily: LYRIC_FONTS.chalk.family,
        titleWeight: 400,
        artistWeight: 400,
        scale: 1.12,
        tracking: 0,
      };
    case 'dankoe':
      return {
        titleFamily: LYRIC_FONTS.editorial.family,
        artistFamily: FONT,
        titleWeight: 600,
        artistWeight: 400,
        scale: 1.04,
        tracking: -0.3,
      };
    case 'newspaper':
    case 'plaque':
    case 'stamp':
    case 'tarot':
    case 'matchbook':
      return {
        titleFamily: LYRIC_FONTS.serif.family,
        artistFamily: LYRIC_FONTS.serif.family,
        titleWeight: 700,
        artistWeight: 400,
        scale: 1,
        tracking: -0.2,
      };
    case 'waxseal':
      return {
        titleFamily: LYRIC_FONTS.editorial.family,
        artistFamily: LYRIC_FONTS.serif.family,
        titleWeight: 600,
        artistWeight: 400,
        scale: 1.04,
        tracking: -0.2,
      };
    case 'receipt':
    case 'floppy':
    case 'boarding':
    case 'blueprint':
    case 'terminal':
      return {
        titleFamily: LYRIC_FONTS.mono.family,
        artistFamily: LYRIC_FONTS.mono.family,
        titleWeight: 700,
        artistWeight: 400,
        scale: 0.88,
        tracking: 0,
      };
    case 'cgimotion':
    case 'minidisc':
      return {
        titleFamily: LYRIC_FONTS.motion.family,
        artistFamily: FONT,
        titleWeight: 700,
        artistWeight: 500,
        scale: 0.82,
        tracking: 0.4,
      };
    case 'lego':
      return {
        titleFamily: LYRIC_FONTS.plastic.family,
        artistFamily: LYRIC_FONTS.plastic.family,
        titleWeight: 700,
        artistWeight: 600,
        scale: 1.02,
        tracking: -0.2,
      };
    case 'comicart':
    case 'manga':
      return {
        titleFamily: LYRIC_FONTS.comicpop.family,
        artistFamily: FONT,
        titleWeight: 400,
        artistWeight: 600,
        scale: 1.14,
        tracking: 0.8,
      };
    case 'cdcase':
    case 'vhs':
    case 'vippass':
      return {
        titleFamily: LYRIC_FONTS.condensed.family,
        artistFamily: FONT,
        titleWeight: 600,
        artistWeight: 500,
        scale: 1.06,
        tracking: 0.4,
      };
    case 'swiss':
    case 'risograph':
      return {
        titleFamily: LYRIC_FONTS.bold.family,
        artistFamily: FONT,
        titleWeight: 400,
        artistWeight: 600,
        scale: 0.94,
        tracking: -0.4,
      };
    default:
      return {
        titleFamily: FONT,
        artistFamily: FONT,
        titleWeight: 700,
        artistWeight: 400,
        scale: 1,
        tracking: -0.5,
      };
  }
}

const headerCache = {
  key: '',
  titleLines: [] as string[],
  titleSize: 38,
  titleLine: 46,
  artist: '',
};

export function drawHeader(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  tilt: TiltState,
  unit = 1,
  fixedExtrude = false
) {
  const f = cardFrame(layout, state.theme, state.hide);
  const x = f.hx;
  const maxWidth = Math.max(80, f.hw - 4);
  const hf = headerFontFor(state.theme);

  const baseTitleSize = Math.round(layout.titleSize * hf.scale);
  const baseTitleLine = Math.max(
    Math.round(baseTitleSize * 1.2),
    Math.round(layout.titleLine * Math.min(1.06, hf.scale))
  );
  const artistSize = Math.max(16, Math.round(layout.artistSize * Math.min(1.05, hf.scale)));
  const artistLine = Math.max(
    Math.round(artistSize * 1.3),
    Math.round(layout.artistLine * Math.min(1.05, hf.scale))
  );

  const title = state.title.trim() || 'Song title';
  const artistText = state.artist.trim() || 'Artist';

  const key = `${fontGen}|${state.theme}|${state.layoutKey}|${maxWidth}|${title}|${artistText}`;
  if (headerCache.key !== key) {
    let resolvedTitleSize = baseTitleSize;
    let resolvedTitleLine = baseTitleLine;

    g.textBaseline = 'top';
    g.font = `${hf.titleWeight} ${resolvedTitleSize}px ${hf.titleFamily}`;
    letterSpacing(g, hf.tracking);
    let lines = wrapLine(g, title, maxWidth);

    // Gently shrink long titles by 15% before ellipsizing on line 2
    if (lines.length > 2) {
      resolvedTitleSize = Math.max(18, Math.round(baseTitleSize * 0.85));
      resolvedTitleLine = Math.round(resolvedTitleSize * 1.22);
      g.font = `${hf.titleWeight} ${resolvedTitleSize}px ${hf.titleFamily}`;
      lines = wrapLine(g, title, maxWidth);
    }

    if (lines.length > 2) {
      lines = lines.slice(0, 2);
      lines[1] = ellipsize(g, lines[1] + ' …', maxWidth);
    }
    headerCache.titleLines = lines.map((l) => ellipsize(g, l, maxWidth));
    headerCache.titleSize = resolvedTitleSize;
    headerCache.titleLine = resolvedTitleLine;

    g.font = `${hf.artistWeight} ${artistSize}px ${hf.artistFamily}`;
    letterSpacing(g, 0);
    headerCache.artist = ellipsize(g, artistText, maxWidth);
    headerCache.key = key;
  }

  const titleLines = state.hide.title ? [] : headerCache.titleLines;
  const titleGap = !state.hide.title && !state.hide.artist ? 4 : 0;
  const total =
    titleLines.length * headerCache.titleLine +
    titleGap +
    (state.hide.artist ? 0 : artistLine);
  const y0 = f.top ? f.hy : f.hy - total / 2;
  const yArtist = y0 + titleLines.length * headerCache.titleLine + titleGap;

  g.textBaseline = 'top';
  g.font = `${hf.titleWeight} ${headerCache.titleSize}px ${hf.titleFamily}`;
  letterSpacing(g, hf.tracking);

  const lay = getLayers(
    Math.round(state.cardDepth * CHILD_DEPTH_RATIO),
    tilt,
    state.color,
    P.wall,
    state.theme,
    16,
    fixedExtrude
  );

  if (lay) {
    for (const o of lay) {
      g.fillStyle = o.color;
      let y = y0;
      for (const line of titleLines) {
        g.fillText(line, x + o.dx, y + o.dy);
        y += headerCache.titleLine;
      }
    }
    if (!state.hide.artist) {
      g.font = `${hf.artistWeight} ${artistSize}px ${hf.artistFamily}`;
      letterSpacing(g, 0);
      for (const o of lay) {
        g.fillStyle = o.color;
        g.fillText(headerCache.artist, x + o.dx, yArtist + o.dy);
      }
      g.font = `${hf.titleWeight} ${headerCache.titleSize}px ${hf.titleFamily}`;
      letterSpacing(g, hf.tracking);
    }
  }

  if (P.glow) {
    g.shadowColor = P.glow;
    g.shadowBlur = 15 * unit;
  }

  for (const p of P.passes) {
    g.fillStyle = p.color;
    let y = y0;
    for (const line of titleLines) {
      g.fillText(line, x + p.dx, y + p.dy);
      y += headerCache.titleLine;
    }
  }

  g.font = `${hf.artistWeight} ${artistSize}px ${hf.artistFamily}`;
  letterSpacing(g, 0);
  for (const p of state.hide.artist ? [] : P.passes) {
    g.globalAlpha = p.main ? 0.82 : 1;
    g.fillStyle = p.color;
    g.fillText(headerCache.artist, x + p.dx, yArtist + p.dy);
  }
  g.globalAlpha = 1;
  if (P.glow) {
    g.shadowColor = 'rgba(0,0,0,0)';
    g.shadowBlur = 0;
  }
}

export const lyricFontObj = (stateFont: string, theme: ThemeKey) => {
  const effectiveKey =
    stateFont === 'auto' ? THEME_FONT[theme] || 'poppins' : stateFont;
  return (LYRIC_FONTS as Record<string, typeof LYRIC_FONTS.poppins>)[
    effectiveKey
  ] || LYRIC_FONTS.poppins;
};

export const lyricFontCss = (
  size: number,
  stateFont: string,
  theme: ThemeKey
) => {
  const f = lyricFontObj(stateFont, theme);
  return `${f.weight} ${(size * f.k).toFixed(2)}px ${f.family}`;
};

function breakWideWord(
  g: CanvasRenderingContext2D,
  word: string,
  maxWidth: number
): string[] {
  const parts: string[] = [];
  let cur = '';
  for (const ch of word) {
    const next = cur + ch;
    if (cur && g.measureText(next).width > maxWidth) {
      parts.push(cur);
      cur = ch;
    } else {
      cur = next;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

export interface LyricRowWord {
  text: string;
  /** 0-based word index within its non-empty lyric line */
  wordIndex: number;
  /** Horizontal offset from the left edge of the row in px */
  xOffset: number;
  /** Measured width of this word token in px */
  width: number;
}

export interface LyricRow {
  text: string;
  h: number;
  /** Index in paras (including nulls, used for manual hlLine) */
  p?: number;
  /** 0-based index among non-empty lines (matches KaraokeTimeline) */
  lineIdx?: number;
  /** Total measured pixel width of this row */
  rowWidth?: number;
  /** Individual words laid out on this row for word-by-word karaoke */
  words?: LyricRowWord[];
}

function measureRowWords(
  g: CanvasRenderingContext2D,
  tokens: { text: string; wordIndex: number }[]
): { rowWidth: number; words: LyricRowWord[] } {
  const fullText = tokens.map((t) => t.text).join(' ');
  const rowWidth = fullText ? g.measureText(fullText).width : 0;
  const words: LyricRowWord[] = [];
  let prefix = '';
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const xOffset = i === 0 ? 0 : g.measureText(prefix).width;
    const width = g.measureText(tok.text).width;
    words.push({
      text: tok.text,
      wordIndex: tok.wordIndex,
      xOffset,
      width,
    });
    prefix += (i === 0 ? '' : ' ') + tok.text + ' ';
  }
  return { rowWidth, words };
}

export function layoutLyrics(
  g: CanvasRenderingContext2D,
  paras: (string[] | null)[],
  size: number,
  maxWidth: number,
  stateFont: string,
  theme: ThemeKey,
  build = false
) {
  // Small safety margin prevents bold/cursive/italic overhang clipping at right edge
  const safeWidth = Math.max(40, maxWidth - 6);
  const lineHeight = Math.round(size * 1.24);
  const gap = Math.round(lineHeight * 0.48);
  const f = lyricFontObj(stateFont, theme);
  g.font = lyricFontCss(size, stateFont, theme);
  letterSpacing(g, -size * 0.015);
  const space = wordWidth(g, ' ', size, f.family, f.weight, f.k);

  const rows: LyricRow[] = [];
  let height = 0;
  let tooWide = false;
  let nonEmptyIdx = 0;

  const pushBuiltRow = (
    line: string,
    pi: number,
    lIdx: number,
    tokens: { text: string; wordIndex: number }[]
  ) => {
    const measured = measureRowWords(g, tokens);
    rows.push({
      text: line,
      h: lineHeight,
      p: pi,
      lineIdx: lIdx,
      rowWidth: measured.rowWidth,
      words: measured.words,
    });
  };

  for (let pi = 0; pi < paras.length; pi++) {
    const words = paras[pi];
    if (!words) {
      height += gap;
      if (build) rows.push({ text: '', h: gap });
      continue;
    }
    const curLineIdx = nonEmptyIdx++;
    let line = '';
    let lineW = 0;
    let rowTokens: { text: string; wordIndex: number }[] = [];

    for (let wi = 0; wi < words.length; wi++) {
      const rawWord = words[wi];
      const rawW = wordWidth(g, rawWord, size, f.family, f.weight, f.k);
      if (rawW > safeWidth) {
        tooWide = true;
        // Break unbreakable super-long tokens so they never spill off the card
        const chunks = breakWideWord(g, rawWord, safeWidth);
        for (const chunk of chunks) {
          const cw = g.measureText(chunk).width;
          if (lineW && lineW + space + cw > safeWidth) {
            height += lineHeight;
            if (build) {
              pushBuiltRow(line, pi, curLineIdx, rowTokens);
              rowTokens = [{ text: chunk, wordIndex: wi }];
            }
            line = build ? chunk : '';
            lineW = cw;
          } else {
            if (build) {
              line = lineW ? line + ' ' + chunk : chunk;
              rowTokens.push({ text: chunk, wordIndex: wi });
            }
            lineW = lineW ? lineW + space + cw : cw;
          }
        }
        continue;
      }

      if (lineW && lineW + space + rawW > safeWidth) {
        height += lineHeight;
        if (build) {
          pushBuiltRow(line, pi, curLineIdx, rowTokens);
          rowTokens = [{ text: rawWord, wordIndex: wi }];
        }
        line = build ? rawWord : '';
        lineW = rawW;
      } else {
        if (build) {
          line = lineW ? line + ' ' + rawWord : rawWord;
          rowTokens.push({ text: rawWord, wordIndex: wi });
        }
        lineW = lineW ? lineW + space + rawW : rawW;
      }
    }
    height += lineHeight;
    if (build) {
      pushBuiltRow(line, pi, curLineIdx, rowTokens);
    }
  }

  letterSpacing(g, 0);
  return { rows, height, tooWide };
}

export function fitLyricSize(
  g: CanvasRenderingContext2D,
  paras: (string[] | null)[],
  maxWidth: number,
  avail: number,
  minSize: number,
  maxSize: number,
  stateFont: string,
  theme: ThemeKey
) {
  const fits = (s: number) => {
    const m = layoutLyrics(g, paras, s, maxWidth, stateFont, theme, false);
    return !m.tooWide && m.height <= avail;
  };

  if (!fits(minSize)) return { size: minSize, overflow: true };
  if (fits(maxSize)) return { size: maxSize, overflow: false };

  let lo = minSize;
  let hi = maxSize - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (fits(mid)) lo = mid;
    else hi = mid - 1;
  }

  let best = lo;
  for (let s = lo + 1, end = Math.min(maxSize, lo + 12); s <= end; s++) {
    if (fits(s)) best = s;
  }
  return { size: best, overflow: false };
}

const fitLyricCache = new Map<
  string,
  {
    size: number;
    overflow: boolean;
    visibleRows: LyricRow[];
    visibleHeight: number;
  }
>();

export function drawLyrics(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  tilt: TiltState,
  unit = 1,
  fixedExtrude = false,
  playback?: PlaybackVisualState | null
) {
  const f = cardFrame(layout, state.theme, state.hide);
  const maxWidth = Math.max(80, f.x1 - f.lx);
  const top = f.ltop;
  const bSpace = barSpace(state.hide.bar, layout.logo);
  const fSpace = footerSpace(state.hide, state.trackId, layout);
  const bottom = f.y1 - fSpace - bSpace;
  const avail = Math.max(40, bottom - top);

  const rawText =
    playback?.isPlaying && playback?.activeLyrics?.trim()
      ? playback.activeLyrics
      : state.lyrics;
  const hasText = rawText.trim().length > 0;
  const text = hasText ? rawText : 'Your lyrics\nwill appear here';
  const paras = parseLyrics(text);

  // Comfortable visual ceiling for auto-fit so short lyrics don't feel overcrowded
  const autoMax = Math.min(
    layout.lyricMax,
    layout.w >= 1200 ? 78 : layout.w <= 720 ? 72 : 88
  );

  // Memoize expensive binary-search fitLyricSize + word-wrapping across 60fps karaoke frames
  const fitCacheKey = `${fontGen}|${state.layoutKey}|${state.theme}|${state.lyricFont}|${
    state.autoFit ? 'auto' : state.lyricSize
  }|${maxWidth}|${avail}|${text}`;

  let size: number;
  let overflow: boolean;
  let visibleRows: LyricRow[];
  let visibleHeight: number;

  const cachedFit = fitLyricCache.get(fitCacheKey);
  if (cachedFit) {
    size = cachedFit.size;
    overflow = cachedFit.overflow;
    visibleRows = cachedFit.visibleRows;
    visibleHeight = cachedFit.visibleHeight;
    g.font = lyricFontCss(size, state.lyricFont, state.theme);
    letterSpacing(g, -size * 0.015);
  } else {
    if (state.autoFit) {
      const fitRes = fitLyricSize(
        g,
        paras,
        maxWidth,
        avail,
        layout.lyricMin,
        autoMax,
        state.lyricFont,
        state.theme
      );
      size = fitRes.size;
      overflow = fitRes.overflow;
    } else {
      size = state.lyricSize;
      const checkLayout = layoutLyrics(
        g,
        paras,
        size,
        maxWidth,
        state.lyricFont,
        state.theme,
        false
      );
      overflow = checkLayout.height > avail || checkLayout.tooWide;
    }

    const layoutRes = layoutLyrics(
      g,
      paras,
      size,
      maxWidth,
      state.lyricFont,
      state.theme,
      true
    );

    // Clamp overflowing rows with an ellipsis on the final visible text row
    g.font = lyricFontCss(size, state.lyricFont, state.theme);
    letterSpacing(g, -size * 0.015);
    visibleRows = layoutRes.rows;
    visibleHeight = layoutRes.height;

    if (layoutRes.height > avail) {
      overflow = true;
      const kept: LyricRow[] = [];
      let used = 0;
      for (const row of layoutRes.rows) {
        if (used + row.h > avail + 2 && kept.length > 0) break;
        kept.push({ ...row });
        used += row.h;
      }
      // Ellipsize last non-empty row to signal truncation cleanly
      for (let i = kept.length - 1; i >= 0; i--) {
        if (kept[i].text) {
          kept[i].text = ellipsize(
            g,
            kept[i].text.replace(/…$/, '') + '…',
            Math.max(40, maxWidth - 6)
          );
          const prevWords = kept[i].words ?? [];
          const splitWords = kept[i].text.split(/\s+/).filter(Boolean);
          const rebuilt = measureRowWords(
            g,
            splitWords.map((t, idx) => ({
              text: t,
              wordIndex:
                prevWords[idx]?.wordIndex ??
                prevWords[prevWords.length - 1]?.wordIndex ??
                idx,
            }))
          );
          kept[i].rowWidth = rebuilt.rowWidth;
          kept[i].words = rebuilt.words;
          break;
        }
      }
      visibleRows = kept;
      visibleHeight = used;
    }

    if (fitLyricCache.size > 48) fitLyricCache.clear();
    fitLyricCache.set(fitCacheKey, {
      size,
      overflow,
      visibleRows,
      visibleHeight,
    });
  }

  g.save();
  // Clip vertically strictly to [top, bottom] so lyrics never collide with progress bar or footer
  g.beginPath();
  g.rect(f.lx - 18, top - 12, maxWidth + 36, avail + 24);
  g.clip();

  g.globalAlpha = hasText ? 1 : 0.45;
  const baseAlpha = g.globalAlpha;
  const hl =
    hasText && state.hlLine >= 0 && state.hlLine < paras.length
      ? state.hlLine
      : -1;

  const hasKaraoke =
    hasText &&
    Boolean(playback?.lineWeights && playback.lineWeights.length > 0);
  const weights = playback?.lineWeights;
  const wordFills = playback?.wordFills;
  const activePara =
    typeof playback?.activeParagraph === 'number'
      ? playback.activeParagraph
      : -1;
  const activeFill =
    typeof playback?.activeLineFill === 'number'
      ? Math.min(1, Math.max(0, playback.activeLineFill))
      : 1;

  const lineIndexFor = (row: LyricRow) =>
    typeof row.lineIdx === 'number' ? row.lineIdx : row.p;

  const ra = (row: LyricRow) => {
    const idx = lineIndexFor(row);
    if (hasKaraoke && weights && typeof idx === 'number') {
      const w = Math.min(1, Math.max(0, weights[idx] ?? 0));
      // Past sung lines stay at 0.50, upcoming lines at 0.28, active line rises to 1.0
      const floor = activePara >= 0 && idx < activePara ? 0.5 : 0.28;
      return baseAlpha * (floor + (1 - floor) * w);
    }
    return hl >= 0 && row.p !== hl ? baseAlpha * 0.34 : baseAlpha;
  };

  // Subtle upward float on the active karaoke line
  const rowLift = (row: LyricRow) => {
    const idx = lineIndexFor(row);
    if (hasKaraoke && weights && typeof idx === 'number') {
      const w = Math.min(1, Math.max(0, weights[idx] ?? 0));
      return -Math.round(w * Math.max(1.5, size * 0.04));
    }
    return 0;
  };

  // Per-word pop/lift so the exact word being sung rises cleanly into place
  const wordLift = (wf: number) => {
    if (wf <= 0.001) return 0;
    if (wf >= 0.999) return -Math.round(Math.max(1.5, size * 0.032));
    const arc = Math.sin(wf * Math.PI);
    return -Math.round(
      arc * Math.max(2.5, size * 0.06) + wf * Math.max(1.5, size * 0.032)
    );
  };

  g.font = lyricFontCss(size, state.lyricFont, state.theme);
  g.textBaseline = 'top';
  letterSpacing(g, -size * 0.015);

  const ax =
    state.align === 'center'
      ? f.lx + maxWidth / 2
      : state.align === 'right'
      ? f.x1
      : f.lx;
  g.textAlign = state.align;

  const y0 =
    top + (f.mid ? Math.max(0, (avail - visibleHeight) / 2) : 0);

  const rowLeftFor = (row: LyricRow) => {
    const tw = row.rowWidth ?? g.measureText(row.text).width;
    return state.align === 'center'
      ? ax - tw / 2
      : state.align === 'right'
      ? ax - tw
      : ax;
  };

  const lay = getLayers(
    Math.round(state.cardDepth * CHILD_DEPTH_RATIO),
    tilt,
    state.color,
    P.wall,
    state.theme,
    20,
    fixedExtrude
  );

  if (lay) {
    for (const o of lay) {
      g.fillStyle = o.color;
      let y = y0;
      for (const row of visibleRows) {
        if (row.text) {
          const idx = lineIndexFor(row);
          const lift = rowLift(row);
          const lwFills =
            hasKaraoke && typeof idx === 'number' ? wordFills?.[idx] : undefined;
          if (
            hasKaraoke &&
            idx === activePara &&
            lwFills &&
            row.words &&
            row.words.length > 0
          ) {
            const rLeft = rowLeftFor(row);
            g.textAlign = 'left';
            for (const rw of row.words) {
              const wf = Math.min(1, Math.max(0, lwFills[rw.wordIndex] ?? 0));
              g.globalAlpha = baseAlpha * (0.32 + 0.68 * wf);
              g.fillText(
                rw.text,
                rLeft + rw.xOffset + o.dx,
                y + o.dy + lift + wordLift(wf)
              );
            }
            g.textAlign = state.align;
          } else {
            g.globalAlpha = ra(row);
            g.fillText(row.text, ax + o.dx, y + o.dy + lift);
          }
        }
        y += row.h;
      }
    }
  }

  if (P.glow) {
    g.shadowColor = P.glow;
    g.shadowBlur = 15 * unit;
  }

  for (const p of P.passes) {
    g.fillStyle = p.color;
    let y = y0;
    for (const row of visibleRows) {
      if (row.text) {
        const idx = lineIndexFor(row);
        const lift = rowLift(row);
        const lwFills =
          hasKaraoke && typeof idx === 'number' ? wordFills?.[idx] : undefined;
        const hasWordSync =
          hasKaraoke &&
          typeof idx === 'number' &&
          idx === activePara &&
          Boolean(lwFills && lwFills.length > 0 && row.words && row.words.length > 0);

        if (hasWordSync && lwFills && row.words) {
          const rLeft = rowLeftFor(row);
          const lineW = Math.min(1, Math.max(0, weights?.[idx!] ?? 1));
          g.textAlign = 'left';

          for (const rw of row.words) {
            const wf = Math.min(1, Math.max(0, lwFills[rw.wordIndex] ?? 0));
            const wLift = wordLift(wf);
            const wx = rLeft + rw.xOffset + p.dx;
            const wy = y + p.dy + lift + wLift;

            if (!p.main) {
              g.globalAlpha = baseAlpha * (0.35 + 0.65 * wf);
              g.fillText(rw.text, wx, wy);
              continue;
            }

            if (wf <= 0.001) {
              // Unsung word in the active line stays cleanly dimmed at its exact spot
              g.globalAlpha = baseAlpha * 0.32;
              g.fillText(rw.text, wx, wy);
            } else if (wf >= 0.999) {
              // Completed word in the active line stays fully illuminated
              g.globalAlpha = baseAlpha * (0.65 + 0.35 * lineW);
              g.fillText(rw.text, wx, wy);
            } else {
              // Currently sung word: dim base + sub-word left-to-right fill sweep + active glow
              g.globalAlpha = baseAlpha * 0.32;
              g.fillText(rw.text, wx, wy);

              g.save();
              g.beginPath();
              g.rect(
                wx - 2,
                wy - 8,
                (rw.width + 4) * wf,
                row.h + 16
              );
              g.clip();
              g.globalAlpha = baseAlpha;
              if (P.glow || state.color) {
                g.shadowColor = P.glow || state.color;
                g.shadowBlur = Math.max(10, 18 * unit);
              }
              g.fillText(rw.text, wx, wy);
              g.restore();
            }
          }

          g.textAlign = state.align;
        } else {
          const isFallbackLineSweep =
            hasKaraoke &&
            p.main &&
            typeof idx === 'number' &&
            idx === activePara &&
            activeFill < 0.99;

          if (isFallbackLineSweep) {
            const w = Math.min(1, Math.max(0, weights?.[idx!] ?? 1));
            g.globalAlpha = baseAlpha * (0.38 + 0.2 * (1 - w));
            g.fillText(row.text, ax + p.dx, y + p.dy + lift);

            const tw = row.rowWidth ?? g.measureText(row.text).width;
            const rowLeft = rowLeftFor(row);
            g.save();
            g.beginPath();
            g.rect(
              rowLeft + p.dx - 4,
              y + p.dy + lift - 6,
              (tw + 8) * activeFill,
              row.h + 12
            );
            g.clip();
            g.globalAlpha = baseAlpha * (0.55 + 0.45 * w);
            if (P.glow || state.color) {
              g.shadowColor = P.glow || state.color;
              g.shadowBlur = 14 * unit * w;
            }
            g.fillText(row.text, ax + p.dx, y + p.dy + lift);
            g.restore();
          } else {
            g.globalAlpha = ra(row);
            g.fillText(row.text, ax + p.dx, y + p.dy + lift);
          }
        }
      }
      y += row.h;
    }
  }

  if (P.glow) {
    g.shadowColor = 'rgba(0,0,0,0)';
    g.shadowBlur = 0;
  }
  g.textAlign = 'left';
  letterSpacing(g, 0);
  g.globalAlpha = 1;
  g.restore();

  return { size, overflow };
}
