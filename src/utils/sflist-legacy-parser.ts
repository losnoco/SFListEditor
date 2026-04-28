/**
 * Parser for the legacy line-based .sflist format.
 *
 * Format reference: sflist.c (sflist_load_v1)
 *
 * Each line:  [modifiers|]path/to/file.sf2
 * Modifiers are '&'-separated before the last '|':
 *   c<N>[-<M>]           channel or inclusive range (1-indexed)
 *   g<float>             gain
 *   p<D>[,<B>][=<S>[,<SB>]]  patch mapping
 *     pD          → dest_program=D, dest_bank=0 (default)
 *     pB,D        → dest_bank=B, dest_program=D
 *     pD=S        → dest_program=D, source_program=S, source_bank=-1 (any)
 *     pB,D=S      → dest_bank=B, dest_program=D, source_program=S, source_bank=-1 (any)
 *     pB,D=SB,S   → dest_bank=B, dest_program=D, source_bank=SB, source_program=S
 */

import type { SFListDocument, SoundFontEntry, PatchMapping, PatchAddress } from 'src/types/sflist';

/** Parse unsigned integer at position pos within s[pos..end). Returns { value, pos } or null. */
function parseUint(s: string, pos: number, end: number): { value: number; pos: number } | null {
    const start = pos;
    let val = 0;
    while (pos < end && s.charCodeAt(pos) >= 48 && s.charCodeAt(pos) <= 57) {
        val = val * 10 + s.charCodeAt(pos) - 48;
        pos++;
    }
    if (pos === start) return null;
    return { value: val, pos };
}

/**
 * Parse a floating-point number at s[pos..end).
 * Must consume the entire [pos..end) range (no trailing garbage allowed).
 * Format: [-]<digits>[.<digits>]
 */
function parseFloat_(s: string, pos: number, end: number): number | null {
    let sign = 1;
    if (pos < end && s[pos] === '-') {
        sign = -1;
        pos++;
    }
    const intResult = parseUint(s, pos, end);
    if (!intResult) return null;
    const whole = intResult.value;
    pos = intResult.pos;

    // If we consumed the whole field, it's a plain integer
    if (pos === end) return whole * sign;

    // Next char must be '.' (otherwise trailing garbage → error)
    if (s[pos] !== '.') return null;

    const decStart = pos + 1;
    const decResult = parseUint(s, decStart, end);
    if (!decResult || decResult.pos !== end) return null;

    const decimalPlaces = decResult.pos - decStart;
    const value = (whole + decResult.value / Math.pow(10, decimalPlaces)) * sign;
    return value;
}

function parseModifiers(mods: string, entry: SoundFontEntry): void {
    const len = mods.length;
    let pos = 0;

    while (pos < len) {
        // Find the end of this modifier field (next '&' or end of string)
        let fieldEnd = pos;
        while (fieldEnd < len && mods[fieldEnd] !== '&') fieldEnd++;

        const c = mods[pos++];

        if (c === '&') {
            // Separator character — skip (mirrors the C parser's case '&': continue)
            continue;
        }

        switch (c) {
            case 'c': {
                // Channel or channel range: c<N> or c<N>-<M>
                const lowResult = parseUint(mods, pos, fieldEnd);
                if (
                    !lowResult ||
                    (mods[lowResult.pos] !== '-' && lowResult.pos !== fieldEnd)
                ) {
                    throw new Error(`Invalid channel number near "${mods.substring(pos, fieldEnd)}"`);
                }
                const low = lowResult.value;
                let high = low;
                if (mods[lowResult.pos] === '-') {
                    const highResult = parseUint(mods, lowResult.pos + 1, fieldEnd);
                    if (!highResult || highResult.pos !== fieldEnd) {
                        throw new Error(`Invalid channel range end near "${mods.substring(pos, fieldEnd)}"`);
                    }
                    high = highResult.value;
                }
                if (!entry.channels) entry.channels = [];
                for (let ch = low; ch <= high; ch++) {
                    if (!entry.channels.includes(ch)) entry.channels.push(ch);
                }
                pos = fieldEnd;
                break;
            }

            case 'g': {
                // Gain: g<float>  (must consume entire field)
                const val = parseFloat_(mods, pos, fieldEnd);
                if (val === null) {
                    throw new Error(`Invalid gain value near "${mods.substring(pos, fieldEnd)}"`);
                }
                entry.gain = val;
                pos = fieldEnd;
                break;
            }

            case 'p': {
                // Patch mapping: p<D>[,<B>][=<S>[,<SB>]]
                let p = pos;

                const v1 = parseUint(mods, p, fieldEnd);
                if (
                    !v1 ||
                    (mods[v1.pos] !== ',' && mods[v1.pos] !== '=' && v1.pos !== fieldEnd)
                ) {
                    throw new Error(`Invalid preset number near "${mods.substring(pos, fieldEnd)}"`);
                }
                p = v1.pos;

                // First value is dest_program; if followed by ',' it becomes dest_bank
                let destBank = -1;
                let destProgram = v1.value;

                if (p < fieldEnd && mods[p] === ',') {
                    destBank = v1.value;
                    p++;
                    const v2 = parseUint(mods, p, fieldEnd);
                    if (!v2 || (mods[v2.pos] !== '=' && v2.pos !== fieldEnd)) {
                        throw new Error(`Invalid preset number near "${mods.substring(pos, fieldEnd)}"`);
                    }
                    destProgram = v2.value;
                    p = v2.pos;
                }

                let sourceBank = -1;
                let sourceProgram = -1;

                if (p < fieldEnd && mods[p] === '=') {
                    p++;
                    const vs1 = parseUint(mods, p, fieldEnd);
                    if (!vs1 || (mods[vs1.pos] !== ',' && vs1.pos !== fieldEnd)) {
                        throw new Error(`Invalid source preset number near "${mods.substring(pos, fieldEnd)}"`);
                    }
                    sourceProgram = vs1.value;
                    p = vs1.pos;

                    if (p < fieldEnd && mods[p] === ',') {
                        sourceBank = vs1.value;
                        p++;
                        const vs2 = parseUint(mods, p, fieldEnd);
                        if (!vs2 || vs2.pos !== fieldEnd) {
                            throw new Error(`Invalid source preset number near "${mods.substring(pos, fieldEnd)}"`);
                        }
                        sourceProgram = vs2.value;
                    }
                }

                // Build the PatchMapping.
                // dest_bank == -1 means the bank was omitted in the legacy format → default is bank 0.
                // source_bank == -1 means "any bank" (the sentinel used throughout this codebase).
                const destination: PatchAddress = {
                    bank: destBank >= 0 ? destBank : 0,
                    ...(destProgram >= 0 ? { program: destProgram } : {}),
                };

                const mapping: PatchMapping = { destination };

                if (sourceProgram >= 0) {
                    const source: PatchAddress = { bank: sourceBank, program: sourceProgram };
                    mapping.source = source;
                }

                if (!entry.patchMappings) entry.patchMappings = [];
                entry.patchMappings.push(mapping);

                pos = fieldEnd;
                break;
            }

            default:
                throw new Error(`Unknown modifier character '${c}' in "${mods}"`);
        }
        // After each case, pos === fieldEnd (pointing at '&' or end).
        // The '&' will be consumed on the next iteration as case '&': continue.
    }

    // Sort channels numerically (mirrors json_array_sort in the C code)
    if (entry.channels) {
        entry.channels.sort((a, b) => a - b);
    }
}

export function parseLegacySflist(text: string): SFListDocument {
    const lines = text.split(/\r\n|\r|\n/);
    const soundFonts: SoundFontEntry[] = [];

    for (const line of lines) {
        // Use the last '|' as the modifier/path separator (mirrors C behavior)
        const pipeIdx = line.lastIndexOf('|');
        const fileName = pipeIdx >= 0 ? line.substring(pipeIdx + 1) : line;

        // Skip empty lines (an empty fileName would be an invalid entry)
        if (!fileName) continue;

        const entry: SoundFontEntry = { fileName };

        if (pipeIdx > 0) {
            parseModifiers(line.substring(0, pipeIdx), entry);
        }

        soundFonts.push(entry);
    }

    return { soundFonts };
}
