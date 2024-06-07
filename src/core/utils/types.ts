/**
 * core 内部的校验类型
 */

import { Enum, List, Tupl, Any } from 'tyshemo';
import { Stream } from '../stream';

export const Handling = new Enum([
  Function,
  new List([Function, Stream]),
  Stream,
]);

export const Binding = new Tupl([Any, Function]);

/**
 * which is always used in styles rules, such as `12px`, `15`, `center`...
 */
export const Unit = new Enum([String, Number]);

export const StyleSheet = new Enum([
  String,
  Object,
  new List([String, Object]),
]);
