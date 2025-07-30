import { STYLE_LANG_TYPES, CLIPBOARD_TYPES,PREVIEW_WEBVIEW } from '../utils/constants';

export type CommandType = typeof CLIPBOARD_TYPES[number] | typeof STYLE_LANG_TYPES[number] | typeof PREVIEW_WEBVIEW[number] ;

export type CodeType = 'html' | 'vue' | 'react' | 'unknown';