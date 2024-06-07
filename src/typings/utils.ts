export type ObjectType = Record<string | number | symbol, any>;

export type NestedKeyOfUnion<Obj extends object> = {
  [Key in keyof Obj]: Obj[Key] extends object
    ? Key | NestedKeyOfUnion<Obj[Key]>
    : Key;
}[keyof Obj & (string | number)];

export type NestedKeyOf<Obj extends object> = Array<NestedKeyOfUnion<Obj>>;

export type NestValueOf<T extends ObjectType> = {
  [Key in keyof T]: T[Key] extends ObjectType
    ? NestValueOf<T[Key]> extends ObjectType
      ? NestValueOf<T[Key]>
      : T[Key]
    : T[Key];
}[keyof T];

export type NonUndefined<T> = T extends undefined ? never : T;

export type UnionToIntersection<T> = (
  T extends any ? (x: T) => any : never
) extends (x: infer R) => any
  ? R
  : never;

/**
 * 用于得到某个class的构造函数，例如：
 * class Some {}
 * ConstructorOf<Some> -> Some类型的构造函数，也就是class Some本身
 * 用处：
 * class Some {
 *  static fn<T>(this: ConstructorOf<T>): void; // -> this: ConstructorOf<T> 规定了该静态方法内的this类型，由于类型推导，此处的this被推导为Some本身
 * }
 */
export type ConstructorOf<T> = new (...args: any[]) => T;

/**
 * abstract class
 */
export type AbstractConstructorOf<T> = abstract new (...args: any[]) => T;

/**
 * 获取一个对象的值的类型
 */
export type ValuesOf<T> = T extends { [key: string]: infer P } ? P : never;

/**
 * 获取给定类的实例
 */
export type InstanceOf<T> = T extends new () => infer P ? P : never;

export type IObj = {
  [key: string | number]: any;
};
