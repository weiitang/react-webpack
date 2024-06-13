interface Quill {
  container: HTMLElement;
  root: HTMLElement;
  on: any;
}
interface QuillResizeModuleOptions {
  [index: string]: any;
}
declare function QuillResizeModule(
  quill: Quill,
  options?: QuillResizeModuleOptions
): void;
export default QuillResizeModule;
