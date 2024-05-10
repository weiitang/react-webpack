/**
 * 转义xml中的敏感字符
 * https://www.cnblogs.com/shoshana-kong/p/11419379.html
 * @param str
 */

const CDATA_TAG_START = '<![CDATA[';
const CDATA_TAG_END = ']]>';

export function hasSensitiveChars(str: string) {
  return /[&<>"']+/.test(str);
}

export function escapeSensitiveChars(str: string) {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function unescapeSensitiveChars(str: string) {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * 对一个对象或文本进行escape
 * @param data
 * @returns
 */
export function escapeObject(data: any): any {
  if (typeof data === 'object' && data !== null) {
    const newData = {};
    Object.keys(data).forEach((v) => {
      newData[v] = escapeObject(data[v]);
    });

    return newData;
  }

  return escapeSensitiveChars(data);
}

/**
 * 对一个对象或文本进行unescape
 * @param data
 * @returns
 */
export function unescapeObject(data: any): any {
  if (typeof data === 'object' && data !== null) {
    const newData = {};
    Object.keys(data).forEach((v) => {
      newData[v] = unescapeObject(data[v]);
    });

    return newData;
  }

  const result = unescapeSensitiveChars(data);

  // 移除CDATA
  // result = removeCDATA(result);

  return result;
}

/**
 * 序列化CDATA，都转为实体符
 * @param str
 * @returns
 */
// export function serializeCDATA(str: string) {
//   if (!str) {
//     return str;
//   }

//   // CDATA不支持嵌套，所以str不能再包含]]>，否则解析失败
//   // return hasSensitiveChars(str) ? `<![CDATA[${str.replace(/\]\]>/g, ']]&gt;')}]]>` : str;

//   // https://forum.bpmn.io/t/formalexpressions-cdata/2851
//   // The behavior you’re observing is correct. As of v0.31.0 bpmn-js 14 will use entity encoding instead of CDATA. Most BPMN tools do that. CDATA has a few issues regarding interoperability which is why we don’t use it anymore. Both escaped entities and CDATA should have the same outcome when being parsed anyway. Why is this relevant for you?
//   // bpmnjs不支持CDATA了，会移除并转为实体符
//   // 为了兼容后台，这里转义为实体符，在输出给后台时转回来
//   return escapeSensitiveChars(`${CDATA_TAG_START}${str}${CDATA_TAG_END}`);
// }

/**
 * 反序列化CDATA，将实体符都转为标签
 * @param str
 * @returns
 */
// export function unserializeCDATA(str: string) {
//   if (!str) {
//     return str;
//   }

//   // bpmnjs会对内容再进行一次转实体操作
//   // 如 <flowable:ma name="skipCondition">&amp;lt;![CDATA[a&amp;lt;1]]&amp;gt;</flowable:ma>
//   let result = str.replace(
//     /&amp;lt;!\[CDATA\[(.*)\]\]&amp;gt;/g,
//     (match, p1) => `${CDATA_TAG_START}${unescapeSensitiveChars(unescapeSensitiveChars(p1))}${CDATA_TAG_END}`,
//   );

//   // 兼容bpmnjs没转的情况
//   result = result.replace(
//     /&lt;!\[CDATA\[(.*)\]\]&gt;/g,
//     (match, p1) => `${CDATA_TAG_START}${unescapeSensitiveChars(p1)}${CDATA_TAG_END}`,
//   );

//   return result;
// }

// 移除<!CDATA[]>，转义其内容中的实体符号
// export function removeCDATA(str: string) {
//   if (typeof str === 'string') {
//     return str.replace(/(?:<!\[CDATA\[)(.*)(?:\]\]>)/g, (match, p1) => unescapeSensitiveChars(p1));
//   }

//   return str;
// }

/**
 * 实体符转为CDATA
 * @param str
 */
export function entityToCDATA(str: string) {
  if (!str) {
    return '';
  }

  // 提取标签内容，存在实体符则转为CDATA
  return str.replace(
    /(<flowable:ma.+>)([^>]+)(<\/flowable:ma>)/g,
    (match, p1, p2, p3) => {
      let content = unescapeSensitiveChars(p2);
      if (hasSensitiveChars(content)) {
        content = `${CDATA_TAG_START}${content}${CDATA_TAG_END}`;
      }

      return `${p1}${content}${p3}`;
    }
  );
}

/**
 * 转义为入库的xml格式
 * @param xml
 */
export function xmlToSave(xml: string) {
  let newXML = xml;

  // 输出时ScriptTask.script的敏感字符被转为实体符，这里提交给后台的不需要转义
  // <bpmb:script><![CDATA[a<1]]></bpmb:script> -> <bpmb:script>&lt;![CDATA[a&lt;1]]&gt;</bpmb:script>
  // newXML = newXML.replace(
  //   /(<bpmn:script>)(.+)(<\/bpmn:script>)/g,
  //   (match: string, p1: string, p2: string, p3: string) => `${p1}${unescapeSensitiveChars(p2)}${p3}`,
  // );

  // 转义flowable:fieldString为flowable:string（因为flowable.json里无法重定义String类型）
  // newXML = newXML
  //   .replace(/<flowable:fieldString/g, '<flowable:string')
  //   .replace(/<\/flowable:fieldString/g, '</flowable:string');

  // 转义bpmn:前缀为空，后台不需要
  newXML = newXML.replace(/<bpmn:/g, '<').replace(/<\/bpmn:/g, '</');

  // 将被转义为实体符的CDATA还原为标签，传给后台（放到提交时处理，不在这里处理）
  // newXML = entityToCDATA(newXML);

  return newXML;
}

/**
 * 转义为展示的xml格式
 * @param xml
 */
export function xmlToDisplay(xml: string) {
  let newXML = xml;
  // console.warn('xmlToDisplay，转义前', xml);

  // 转义flowable:string为flowable:fieldString（因为flowable.json里无法重定义String类型）
  // newXML = newXML
  //   .replace(/<flowable:string/g, '<flowable:fieldString')
  //   .replace(/<\/flowable:string/g, '</flowable:fieldString');

  // 过滤CDATA标签，其他的转为实体符 （bpmnjs内部会自动过滤CDATA，这里不需要再处理）
  // newXML = CDATAtoDisplay(newXML);

  // 添加bpmn:前缀
  newXML = newXML.replace(
    /(<\/?)([^<>\s:]+)(\s+[^<>]*)?(>)/g,
    (match, p1, p2, p3, p4) => {
      // 排除 <?xml version="1.0"?>  <!DOCTYPE note SYSTEM "book.dtd">等，p2首个需要是字母才可以
      // xml标签不能以“数字”、“标点符号”、“xml”、“空格”开头
      let tag = p2;
      if (/^[a-z]+/i.test(tag)) {
        tag = `bpmn:${p2}`;
      }
      return `${p1}${tag}${p3 || ''}${p4}`;
    }
  );

  // console.warn('xmlToDisplay，转换后', newXML);

  return newXML;
}

/**
 * 表单内容转为xml支持的文本类型
 * @param value
 * @returns
 */
export function toString(value: any) {
  try {
    return value === undefined || value === null ? '' : value.toString();
  } catch (e) {
    return '';
  }
}

/**
 * 导出bpmn文件
 * @param filename
 * @param text
 */
export function downloadBpmn(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:application/xml;charset=utf-8,${encodeURIComponent(text)}`
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
