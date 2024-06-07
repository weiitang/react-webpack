/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  each,
  getConstructorOf,
  isArray,
  isInstanceOf,
  isFunction,
  makeKeyChain,
  assign,
  createProxy,
  isEmpty,
  define,
  decideby,
  mixin,
  isObject,
} from 'ts-fns';
import { Ty, Rule, ifexist, eject } from 'tyshemo';
import produce from 'immer';
import { Component as ReactComponent, useRef, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { ConstructorOf } from '@typings/utils';
import { Stream } from './stream';
import Style from './style/style';
import ClassName from './style/classname';
import { Binding, Handling } from './utils/types';
import {
  noop,
  isShallowEqual,
  parseClassNames,
  createTwoWayBinding,
  createProxyHandler,
} from './utils/utils';

export class PrimitiveComponent<P, S = any> extends ReactComponent<P, S> {
  @eject() _hooks: any[];

  @eject() $$hooks: any[];

  constructor(props: P) {
    super(props);

    this._hooks = [];

    // render
    const render = this.render ? this.render.bind(this) : null;
    const Render = this.Render ? this.Render.bind(this) : null;

    const hooks = this.$$hooks;
    if (hooks) {
      hooks.forEach((hook) => {
        const { name, type, fn } = hook;
        if (type === 'getter') {
          const getter = fn.bind(this);
          const get = this.hook(getter);
          define(this, name, { get, configurable: true, enumerable: true });
        } else if (type === 'handler') {
          const handler = fn.bind(this);
          this[name] = this.hook(handler, (res) => () => res);
        }
      });
    }

    const RenderWrapper = (props) => {
      const hooks = useRef([...this._hooks]);
      hooks.current.forEach((hook) => {
        const [getter, creator] = hook;
        let res = getter();
        if (creator) {
          const handle = creator(res);
          res = handle;
        }
        // eslint-disable-next-line no-param-reassign
        hook[2] = res;
      });

      let tree = null;

      if (Render) {
        tree = <Render {...props} />;
      } else {
        tree = render();
      }

      return tree;
    };
    const proxyRender = () => {
      if (!Render && !this._hooks.length) {
        return render();
      }

      const { props } = this;
      return <RenderWrapper {...props} />;
    };
    define(this, 'render', { value: proxyRender, configurable: true });
  }

  /**
   * 只传一个函数，则返回其结果的getter
   * @param getter
   */
  hook<T>(getter: () => T): () => T;
  /**
   * 传入了creator，代表这将返回一个handle。虽然也是返回一个函数，但是其返回的结果直接指向了handle函数，而非和上面那种情况的getter
   * @param getter
   * @param creator getter的返回值将作为creator的参数，creator必需返回一个函数
   */
  hook<T, H extends (...args: any[]) => any>(
    getter: () => T,
    creator?: (arg: T) => H
  ): H;
  hook(getter, creator?) {
    const hook = [getter, creator];
    this._hooks.push(hook);
    return (...args: any[]) => {
      const [, , res] = hook;
      if (creator) {
        return res?.(...args);
      }
      return res;
    };
  }

  /**
   * 可在内部使用hooks的render方法
   * @param props
   */
  Render?(props: P): ReactElement | ReactNode;

  /**
   * 基于this.hook（作为第一个参数），可在getter或方法内部使用hook函数，注意，对方法使用@Component.hook时，该方法不允许存在参数
   * @returns
   * @example
   *
   * @Component.hook()
   * get financings() {
   *   const [data] = useDataSource(this.service.financings, this.props.projectId)
   *   return data
   * }
   *
   * @Component.hook()
   * get handleGo() {
   *   const navigate = useRouteNavigate()
   *   return (id) => navigate(id)
   * }
   *
   * // 下面这种用法比较少用到
   * @Component.hook()
   * recoverData() {
   *   const [data] = useDataSource(this.service.financings, this.props.projectId)
   *   useEffect(() => {
   *     this.model.fromJSON(data)
   *   }, [data])
   * }
   */
  static hook() {
    return (protos, key, descriptor) => {
      if (!protos.$$hooks) {
        // eslint-disable-next-line no-param-reassign
        protos.$$hooks = [];
      }

      const { value, get } = descriptor;
      if (get) {
        protos.$$hooks.push({
          name: key,
          type: 'getter',
          fn: get,
        });
      } else if (typeof value === 'function') {
        protos.$$hooks.push({
          name: key,
          type: 'handler',
          fn: value,
        });
      }
    };
  }

  /**
   * 缓存结果，避免每次计算，注意，只执行一次
   * @returns
   * @example
   * @Component.memo()
   * get handleClick() {
   *   // 虽然内部返回了一个新函数，但是对于this.handleClick而言，它的引用不会变
   *   return () => null
   * }
   *
   * @Component.memo() // 相当于 this.handleClick = this.handleClick.bind(this)
   * handleClick() {
   * }
   */
  static memo() {
    return (protos, key, descriptor) => {
      if (!protos.$$hooks) {
        // eslint-disable-next-line no-param-reassign
        protos.$$hooks = [];
      }

      const { value, get } = descriptor;
      if (get) {
        protos.$$hooks.push({
          name: key,
          type: 'getter',
          fn() {
            const ref = useMemo(get.bind(this), []);
            return ref;
          },
        });
      } else if (typeof value === 'function') {
        protos.$$hooks.push({
          name: key,
          type: 'getter',
          fn() {
            const ref = useMemo(() => value.bind(this), []);
            return ref;
          },
        });
      }
    };
  }
}

export class Component<P = any, S = any> extends PrimitiveComponent<P, S> {
  _schedulers: any[];
  _tasksQueue: any[];
  _tasksRunner: any;

  _isMounted: boolean;
  _isUnmounted: boolean;
  _effectors: object;
  _factors: any;

  _cssRules: object;

  readonly attrs: P & {
    [key: string]: any;
  };
  readonly className: string;
  readonly style: any;
  readonly $attrs: P & {
    [key: string]: any;
  };
  readonly children: any;
  readonly $state: S;

  private __inited: boolean;

  constructor(props: P) {
    super(props);

    this.init();

    this._schedulers = [];

    this._tasksQueue = [];
    this._tasksRunner = null;

    this._isMounted = false;
    this._isUnmounted = false;

    this._effectors = null;

    let $state = null;
    define(this, '$state', () => {
      if ($state) {
        return $state;
      }
      if (this.state) {
        $state = createTwoWayBinding(this.state, (value, keyPath) => {
          this.update(keyPath, value).then(() => {
            // clear cache each time update
            $state = null;
          });
        });
        return $state;
      }
      return null;
    });

    const setState = this.setState.bind(this);
    define(this, 'setState', {
      value: (...args) => {
        $state = null; // clear $state in order to rebuild $state
        return setState(...args);
      },
    });

    define(this, 'update', { value: this.update.bind(this) });
    define(this, 'forceUpdate', { value: this.forceUpdate.bind(this) });
    define(this, 'weakUpdate', { value: this.weakUpdate.bind(this) });

    const render = this.render.bind(this);
    const toRender = () => {
      // 延迟到组件挂载时再来执行provide和offer
      // provide必须在offer前执行，因为我们大部分情况下都是在offer中使用provide的结果
      if (!this._isMounted && !this._isUnmounted) {
        this.__provide();
        this._digest(props);
        this.onInit();
        this.__inited = true;
        each(this, (value, key) => {
          if (isObject(value) && value.$$type === 'offer' && value.fn) {
            this[key] = value.fn();
          }
        });
      }
      return render();
    };
    define(this, 'render', { value: toRender, configurable: true });

    this.__init();
  }

  __init() {}

  __provide() {}

  init() {
    // should be override
  }

  offer(fn) {
    if (!this.__inited) {
      return { $$type: 'offer', fn };
    }
    return fn();
  }

  subscribe(name, affect) {
    const upperCaseName = name.replace(name[0], name[0].toUpperCase());
    this._schedulers.push({
      name: upperCaseName,
      affect,
    });
    return this;
  }

  unsubscribe(name, affect) {
    const upperCaseName = name.replace(name[0], name[0].toUpperCase());
    this._schedulers.forEach((item, i) => {
      if (upperCaseName === item.name && (!affect || affect === item.affect)) {
        this._schedulers.splice(i, 1);
      }
    });
    return this;
  }

  dispatch(name, data) {
    if (isArray(name)) {
      const names = name;
      names.forEach((name) => {
        this.dispatch(name, data);
      });
      return this;
    }

    const upperCaseName = name.replace(name[0], name[0].toUpperCase());
    const stream = this[`${upperCaseName}$`];
    if (!stream) {
      return this;
    }

    this[`${upperCaseName}$`].next(data);
    return this;
  }

  weakUpdate() {
    return new Promise((callback) => {
      this.setState({}, () => callback(null));
    });
  }

  forceUpdate() {
    return new Promise((callback) => {
      if (!this._isMounted || this._isUnmounted) {
        callback(null);
        return;
      }

      this.onUpdate(this.props, this.state);
      this._digest(this.props);
      super.forceUpdate(() => callback(null));
    });
  }

  update(...args) {
    return new Promise((callback) => {
      if (!this._isMounted || this._isUnmounted) {
        callback(null);
        return;
      }

      if (args.length === 2) {
        const [keyPath, fn] = args;
        const next = produce(this.state, (state) => {
          assign(state, keyPath, fn);
        });
        this.setState(next, () => callback(null));
      } else if (args.length === 1) {
        const arg = args[0];
        if (typeof arg === 'function') {
          const next = produce(this.state, (state) => {
            arg(state);
          });
          // we can delete a property of state in fn
          const existingKeys = Object.keys(this.state);
          existingKeys.forEach((key) => {
            if (!(key in next)) {
              next[key] = void 0;
            }
          });
          this.setState(next, () => callback(null));
        } else if (typeof arg && typeof arg === 'object') {
          this.setState(arg, () => callback(null));
        } else if (arg === true) {
          this.forceUpdate().then(callback);
        } else {
          this.setState({}, () => callback(null));
        }
      } else {
        this.setState({}, () => callback(null));
      }
    });
  }

  nextTick(...params) {
    const [delay, fn, ...args] = params;
    if (typeof delay === 'number') {
      this._tasksQueue.push({ delay, fn, args });
    } else {
      args.unshift(fn);
      this._tasksQueue.push({ fn: delay, args });
    }
    setTimeout(
      () => {
        this._runTasks();
      },
      typeof delay === 'number' ? delay + 10 : 60
    );
  }

  _runTasks() {
    // dont run two runner at the same time
    if (this._tasksRunner) {
      return;
    }

    if (!this._tasksQueue.length) {
      clearTimeout(this._tasksRunner);
      return;
    }

    const run = () => {
      const start = Date.now();
      const consume = () => {
        if (!this._tasksQueue.length) {
          clearTimeout(this._tasksRunner);
          return;
        }

        const { delay, fn, args } = this._tasksQueue.shift();

        if (delay) {
          setTimeout(() => fn(...args), delay);
          consume();
          return;
        }

        fn(...args);

        const now = Date.now();
        // splice time by 16ms
        // when a function call is more than 8ms, tasks should be holded for 8ms to wait other function calls
        if (now - start > 8) {
          this._tasksRunner = setTimeout(run, 8);
        } else {
          this._tasksRunner = setTimeout(consume, 0);
        }
      };
      consume();
    };
    run();
  }

  _digest(props) {
    const Constructor = getConstructorOf(this);
    const { props: PropsTypes, defaultStylesheet, css } = Constructor;
    const parsedProps = this.onParseProps(props);
    const { children, stylesheet, style, className, ...attrs } = parsedProps;

    // normal attrs
    const finalAttrs = {};
    // two-way binding:
    const bindingAttrs = {};
    // handlers
    const handlingAttrs = {};

    // prepare for attrs data
    each(attrs, (data, key) => {
      if (/^\$[a-zA-Z]/.test(key)) {
        bindingAttrs[key] = data;
        // eslint-disable-next-line prefer-destructuring
        finalAttrs[key.substr(1)] = data[0]; // $show={[value, update]} => finalAttrs[show]=value
      } else if (/^on[A-Z]/.test(key)) {
        handlingAttrs[key] = data;
      } else {
        finalAttrs[key] = data;
      }
    });

    // prepare for data type checking
    if (process.env.NODE_ENV !== 'production' && PropsTypes) {
      const checkPropTypes = (propTypes) => {
        const finalTypes = {};
        const bindingTypes = {};
        const handlingTypes = {};

        each(attrs, (_data, key) => {
          if (/^\$[a-zA-Z]/.test(key)) {
            if (!bindingTypes[key]) {
              bindingTypes[key] = Binding;
            }
          } else if (/^on[A-Z]/.test(key)) {
            if (!handlingTypes[key]) {
              handlingTypes[key] = Handling;
            }
          }
        });

        each(propTypes, (type, key) => {
          if (/^\$[a-zA-Z]/.test(key)) {
            const attr = key.substr(1);
            finalTypes[attr] = type;
            bindingTypes[key] =
              isInstanceOf(type, Rule) && type.name === 'ifexist'
                ? ifexist(Binding)
                : Binding;
          }
          // onChange: true -> required
          // onChange: false -> not reuqired
          else if (/^on[A-Z]/.test(key)) {
            handlingTypes[key] = !type ? ifexist(Handling) : Handling;
          } else {
            finalTypes[key] = type;
          }
        });

        Ty.expect(bindingAttrs).to.match(bindingTypes);
        Ty.expect(handlingAttrs).to.be(handlingTypes);

        // don't check again when update and the same prop has same value
        if (this._isMounted) {
          const currentProps = this.props;
          each(finalAttrs, (value, key) => {
            if (
              (isEmpty(currentProps[key]) && isEmpty(value)) ||
              currentProps[key] === value
            ) {
              delete finalTypes[key];
            }
          });
        }

        Ty.expect(finalAttrs).to.match(finalTypes);
      };
      if (isFunction(PropsTypes)) {
        this.nextTick(() => {
          const propTypes = PropsTypes();
          checkPropTypes(propTypes);
        });
      } else {
        checkPropTypes(PropsTypes);
      }
    }

    // import css and transform css rules
    this._cssRules = decideby(() => {
      if (!css) {
        return {};
      }
      const rules = isFunction(css)
        ? css(
            {
              attrs: this.attrs,
              className: this.className,
              style: this.style,
              props: this.props,
            },
            this
          )
        : css;
      return { ...rules };
    });

    // format stylesheet by using stylesheet, className, style props
    // @ts-ignore
    this.className = decideby(() => {
      const classNameQueue = []
        .concat(defaultStylesheet)
        .concat(stylesheet)
        .concat(className);
      return ClassName.create(classNameQueue);
    });

    // Format stylesheet by using stylesheet, className, style props
    // @ts-ignore
    this.style = decideby(() => {
      const styleQueue = []
        .concat(defaultStylesheet)
        .concat(stylesheet)
        .concat(style);
      return Style.create(styleQueue);
    });

    // generate this.children
    // @ts-ignore
    this.children = children;

    // createProxy will cost performance, so we only createProxy when attrs are changed in 2 deepth
    if (
      !this._isMounted ||
      (this._isMounted &&
        !isShallowEqual(finalAttrs, this.attrs, isShallowEqual))
    ) {
      // get original data (without proxied)
      // @ts-ignore
      this.attrs = finalAttrs as P;
      // create two-way binding props
      const handlers = createProxyHandler(finalAttrs, (keyPath, value) => {
        const chain = isArray(keyPath) ? [...keyPath] : makeKeyChain(keyPath);
        const root = chain.shift();
        const bindKey = `$${root}`;
        const bindData = bindingAttrs[bindKey];
        if (!bindData) {
          return;
        }

        const [current, update] = bindData;
        if (chain.length) {
          const next = produce(current, (data) => {
            assign(data, chain, value);
          });
          update(next, current);
        } else {
          update(value, current);
        }
      });
      // @ts-ignore
      this.$attrs = createProxy(finalAttrs, handlers);
    }

    // DROP: because we may remove static props when build
    // // make sure the handler can be called in component
    // // i.e. static props = { onChange: false } and developer did not pass onChange
    // if (PropsTypes) {
    //   each(PropsTypes, (value, key) => {
    //     if (/^on[A-Z]/.test(key) && !value && !handlingAttrs[key]) {
    //       handlingAttrs[key] = false
    //     }
    //   })
    // }

    const affect = (name, subject) => {
      this._schedulers.forEach((item) => {
        if (name === item.name) {
          // eslint-disable-next-line no-param-reassign
          subject = item.affect(subject) || subject;
          if (process.env.NDOE_ENV !== 'production') {
            Ty.expect(subject).to.be(Stream);
          }
        }
      });
      return subject;
    };

    /**
     * use the passed handler like onClick to create a stream
     * @param {*} param
     */
    const streams = {};
    each(handlingAttrs, (param, key) => {
      const name = key.replace('on', '');
      const sign = `${name}$`;

      if (isInstanceOf(param, Stream)) {
        streams[sign] = param;
        return;
      }

      const stream = new Stream();

      let subject = stream;
      let subscribe = noop;

      // key may not exist on props when developers use `onChange: false`
      if (param) {
        const args = isArray(param) ? [...param] : [param];

        subscribe = args.pop(); // the last function of passed params will be force treated as subscriber

        if (args.length) {
          // @ts-ignore
          subject = subject.pipe(...args.filter((item) => isFunction(item)));
        }
      }

      subject = affect(name, subject);
      subject.subscribe(subscribe);

      streams[sign] = stream;
    });

    // create streams from static properties
    each(
      Constructor,
      ({ value: fn }, key) => {
        if (!isFunction(fn)) {
          return;
        }

        // only those begin with upper case
        if (!/^[A-Z].*\$$/.test(key)) {
          return;
        }

        // notice that, it will be oveerided by passed on* stream
        if (key in streams) {
          if (this[key] && isInstanceOf(this[key], Stream)) {
            // finish stream, free memory
            this[key].complete();
            delete this[key];
          }
          return;
        }

        if (this[key] && isInstanceOf(this[key], Stream)) {
          streams[key] = this[key];
          return;
        }

        const stream = new Stream();
        const name = key.substr(0, key.length - 1);
        const subject = affect(name, stream);
        fn.call(this, subject);
        streams[key] = stream;
      },
      true
    );

    each(this, (_, key) => {
      // notice that, developers' own component properties should never have UpperCase $ ending words, i.e. Name$, but can have name$
      if (!/^[A-Z].*\$$/.test(key)) {
        return;
      }
      // keep the unchanged streams
      if (key in streams && this[key] === streams[key]) {
        return;
      }
      // finish stream, free memory
      this[key].complete();
      delete this[key];
    });
    each(streams, (stream, name) => {
      this[name] = stream;
    });

    this.onDigested();
  }

  css(...classNames): any {
    if (classNames.length === 1 && isArray(classNames[0])) {
      // eslint-disable-next-line prefer-destructuring,no-param-reassign
      classNames = classNames[0];
    }
    return parseClassNames(classNames, this._cssRules);
  }

  _affect(fn) {
    const nextEffectors = this.detectAffect(this.props);
    if (
      nextEffectors === true ||
      !isShallowEqual(this._effectors, nextEffectors)
    ) {
      const deferer = Promise.resolve(this.onAffect());
      const runner = Promise.resolve(fn());
      deferer
        .then(() => runner)
        .then(() => this.onAffected())
        .catch(noop);
      if (nextEffectors !== true) {
        this._effectors = nextEffectors as object;
      }
    } else {
      fn();
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this._affect(() => this.onMounted());
    this._runTasks();
  }
  shouldComponentUpdate(nextProps, nextState) {
    const needUpdate = this.shouldUpdate(nextProps, nextState);
    let isNeed = needUpdate;

    if (isArray(needUpdate)) {
      isNeed = !isShallowEqual(this._factors, needUpdate, isShallowEqual);
      this._factors = needUpdate;
    }

    if (!isNeed) {
      this.onNotUpdate(nextProps, nextState);
      return false;
    }

    this.onUpdate(nextProps, nextState);
    this._digest(nextProps);
    return true;
  }
  componentDidUpdate(prevProps, prevState) {
    this._affect(() => this.onUpdated(prevProps, prevState));
    this._runTasks();
  }
  componentWillUnmount() {
    this.onUnmount();
    // complete all streams, so that async operations will never emit
    each(this, (_value, key) => {
      if (/^[A-Z].*\$$/.test(key)) {
        this[key].complete(); // finish stream, free memory
        delete this[key];
      }
    });
    // dont run any task any more
    this._tasksQueue.length = 0;
    clearTimeout(this._tasksRunner);
    // tag unmounted
    this._isUnmounted = true;
    this._isMounted = false;
  }
  componentDidCatch(error) {
    this.onCatch(error);
  }

  // Lifecircle Hooks
  onInit() {}
  onMounted() {}
  shouldUpdate(_nextProps: P, _nextState: S): boolean | any[] {
    return true;
  }
  onNotUpdate(_nextProps: P, _nextState: S) {}
  onUpdate(_nextProps: P, _nextState: S) {}
  onUpdated(_prevProps: P, _prevState: S) {}
  onUnmount() {}
  onCatch(_error: Error) {}
  onDigested() {}
  detectAffect(_nextProps: P): boolean | object {
    return true;
  }
  onAffect() {}
  onAffected() {}
  onParseProps(props) {
    return props;
  }

  static extend<T, P, S>(
    this: ConstructorOf<T>,
    overrideProps:
      | ((nextProps: P) => {
          stylesheet: { [key: string]: any } | { [key: string]: any }[];
          props: Partial<P>;
          deprecated: string[];
        })
      | {
          stylesheet: { [key: string]: any } | { [key: string]: any }[];
          props: Partial<P>;
          deprecated: string[];
        }
  ): ConstructorOf<T> {
    // @ts-ignore
    return class extends this<P, S> {
      _digest(nextProps) {
        const { stylesheet, props, deprecated } =
          typeof overrideProps === 'function'
            ? overrideProps(nextProps)
            : overrideProps;
        const useProps = {
          ...nextProps,
          ...(props || {}),
          stylesheet: []
            .concat(nextProps.stylesheet || [])
            .concat(stylesheet || []),
        };
        if (deprecated) {
          each(deprecated, (key) => {
            delete useProps[key];
          });
        }
        super._digest(useProps);
      }
    };
  }

  static implement<T>(
    this: ConstructorOf<T>,
    protos: new (...args: any[]) => any
  ): ConstructorOf<T> {
    mixin(this, protos);
    return this;
  }
}
export default Component;
