import { STYLE_LANG_TYPES, CLIPBOARD_TYPES } from '../utils/constants';

export type CommandType = typeof CLIPBOARD_TYPES[number] | typeof STYLE_LANG_TYPES[number];

export type CodeType = 'html' | 'vue' | 'react' | 'unknown';