export class ClipBoardService {
  /**
   * 写入剪切板
   * @param content : ;
   */
  write(content) {
    return navigator.clipboard.writeText(content);
  }

  /**
   * 读取剪切板
   */
  read() {
    return navigator.clipboard.readText();
  }
}
