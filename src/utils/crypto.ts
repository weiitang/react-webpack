import CryptoJS from 'crypto-js';

type EncryptzType = 'string' | 'base64';

// 解密方法
export function decrypt(word, key: string, type: EncryptzType = 'base64') {
  let encryptedHexStr;
  if (type === 'string') {
    encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  } else {
    encryptedHexStr = CryptoJS.enc.Base64.parse(word);
  }
  const _word = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const _key = CryptoJS.enc.Utf8.parse(key);
  const decrypt = CryptoJS.AES.decrypt(_word, _key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

// 加密方法
export function encrypt(word, key: string, type: EncryptzType = 'base64') {
  const _word = CryptoJS.enc.Utf8.parse(word);
  const _key = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.AES.encrypt(_word, _key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  if (type === 'string') {
    return encrypted.ciphertext.toString();
  }
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext).toString();
}
