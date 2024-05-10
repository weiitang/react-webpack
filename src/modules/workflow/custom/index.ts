/**
 * bpmn通过 Modeler._modelingModules 注册了一堆module，每个Module实现了一些功能
 *
 * bpmn2.0标准 https://www.omg.org/spec/BPMN/2.0.2/PDF/changebar
 *
 * Module大概格式如下：
 * XXXModule = {
 *    __depends__ = [依赖的模块],
 *    __init__: [customXXX], // 需要初始化的模块，首字母小写，如customXXX
 *    customXXX: ['type', CustomXXX实现],
 *    customZZZ: ['type', CustomZZZ实现], // 这个不在__init__里，应该是会自动注入，方便$inject的地方调用
 * }
 *
 * CustomXXX.$inject = [一些依赖的模块，会反应到构造函数的参数里]
 *
 * Modeler._modelingModules = [建模module]
 * Modeler._interactionModules = [交互module]
 *
 *
 * 【flowable.json定义注意事项】
 * 1、types.name需要首字母大写，否则在加载显示时会异常，自定义元素丢失（保存时没影响）
 * 2、uri的地址需要跟.xml/.bpmn文件内definitions定义的一致，否则解析失败
 *
 */
import CustomContextPad from './CustomContextPad';
import CustomPalette from './CustomPalette';
// import CustomRenderer from './CustomRenderer';
import EventRenderer from './EventRenderer';
// import TaskRenderer from './TaskRenderer';
import PopupMenuProvider from './PopupMenuProvider';

export default {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // __init__: ['customContextPad', 'customPalette', 'customRenderer'],
  // customPalette: ['type', CustomPalette],
  // customContextPad: ['type', CustomContextPad],
  // customRenderer: ['type', CustomRenderer],

  // 重置内置的palette及pad，通过重定义paletteProvider及contextPadProvider的内部命名实现
  // 参考bpmn-modeler.devemopment.js L60051注释说明
  //
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __init__: [
    'paletteProvider',
    'contextPadProvider',
    'eventRenderer',
    'replaceMenuProvider',
  ],
  paletteProvider: ['type', CustomPalette],
  contextPadProvider: ['type', CustomContextPad],
  // defaultRenderer: ['type', CustomRenderer],
  // customRenderer: ['type', CustomRenderer],
  eventRenderer: ['type', EventRenderer],
  // taskRenderer: ['type', TaskRenderer],
  replaceMenuProvider: ['type', PopupMenuProvider], // 替换内置
};
