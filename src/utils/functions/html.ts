/* eslint-disable @typescript-eslint/naming-convention */

const entityMap = {
  escape: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  },
  unescape: {
    '&amp;': '&',
    '&apos;': "'",
    '&gt;': '>',
    '&lt;': '<',
    '&quot;': '"',
  },
};
const entityReg = {
  escape: RegExp(`[${Object.keys(entityMap.escape).join('')}]`, 'g'),
  unescape: RegExp(`(${Object.keys(entityMap.unescape).join('|')})`, 'g'),
};

// 将HTML转义为实体
export function escape(html) {
  if (typeof html !== 'string') return '';
  return html.replace(entityReg.escape, (match) => entityMap.escape[match]);
}

// 将实体转回为HTML
export function unescape(str) {
  if (typeof str !== 'string') return '';
  return str.replace(entityReg.unescape, (match) => entityMap.unescape[match]);
}

/**
 * 将html转化为纯文本
 * @param html
 * @returns
 */
export function clearHtml(html) {
  const str = html.replace(/<\/?.+?>/g, '');
  return str;
}

/**
 * 将html格式化为代\n换行的纯文本
 */
export function pureHtml(html) {
  const str = html
    .replace(/<\/(div|p|blockquota|pre|section)>/g, '\n')
    .replace(/<br.*?\/?>/g, '\n')
    .replace(/<\/?.+?>/g, '');
  return str;
}
