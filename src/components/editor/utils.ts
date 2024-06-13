/**
 * 将以base64的图片url数据转换为File
 * @param urlData
 */
const base64ToFile = (urlData) => {
  const dataArr = urlData.split(',');
  const imageType = dataArr[0].match(/:(.*?);/)[1];
  const textData = window.atob(dataArr[1]);
  const arrayBuffer = new ArrayBuffer(textData.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < textData.length; i++) {
    uint8Array[i] = textData.charCodeAt(i);
  }
  const fileName = dataArr[1]?.substring(0, 16) || '';
  return new File([arrayBuffer], `${fileName}.${imageType.slice(6)}`, {
    type: imageType,
  });
};

/**
 * 是否是外部链接
 * @param url
 * @returns bool
 */
const isOutLink = (url: string) => {
  const slefOrgin = location.origin;
  return url?.startsWith('http') && url?.indexOf(slefOrgin) === -1;
};

export { base64ToFile, isOutLink };
