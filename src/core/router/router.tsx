/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { eject } from 'tyshemo';
import { isInheritedOf, createSafeExp, isFunction } from 'ts-fns';
import { useShallowLatest, useForceUpdate } from '@src/hook';
import { parseUrl, parseSearch, resolveUrl } from '@src/utils/url';
import type { IObj } from '@src/typings/type';
import type { ComponentType, ReactElement } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { Component } from '../component';
import { findInfoByMapping } from '../utils/utils';
import { History } from './history';

/**
 * 在启动器中被使用，用于获取基于启动器配置的信息
 */
export const rootContext = createContext<{
  history?: any;
  mode?: any;
  options?: IObj;
}>(null);

/**
 * 在目标路径组件中使用，用于读取当前路径
 */
const absContext = createContext({
  abs: '/',
  deep: [],
});

/**
 * 在目标路径组件中使用，用于读取当前路径对应路由的信息
 */
const routeContext = createContext<{
  params?: object;
  path?: string;
  url?: string;
  abs?: string;
  exact?: boolean;
}>({});

/**
 * 再目标路径组件中使用，用于读取定义目标路径的路由器的信息
 */
const routerContext = createContext<{
  abs?: string;
  deep?: string[];
  current?: Router;
  parent?: Router;
}>({});

/**
 * 用于传递mapping
 */
const mappingContext = createContext([]);

/**
 * 用于传递params
 */
const paramsContext = createContext({});

export type IRouteOptions =
  | {
      path: string;
      component?: ComponentType | ((props?: any) => ReactElement);
      default?: boolean;
      exact?: boolean;
      params?: {
        [key: string]: boolean | string;
      };
      props?: {
        [key: string]: boolean | string;
      };
    }
  | {
      name: string;
      component?: ComponentType | ((props?: any) => ReactElement);
      default?: boolean;
      exact?: boolean;
      params?: {
        [key: string]: boolean | string;
      };
      props?: {
        [key: string]: boolean | string;
      };
      /**
       * works for Stack.Screen
       */
      screenOptions?: IObj;
    }
  | {
      path: string;
      redirect: string;
    };

export type IRouterOptions = {
  routes: Array<IRouteOptions>;
  /**
   * 定义局部的路由地图，使用 usePermanentNavigate 或 usePermanentLink 来对接
   * 值为相对当前路由的路径
   * @example
   * mapping: {
   *   KICKOFF_LIST: '.',
   * }
   *
   * const navigate = usePermanentNavigate()
   * naviate('KICKOFF_LIST')
   *
   * 只要这段代码再定义 mapping 所在路由的内部，都可以被使用，
   * 而且其最终路径是以定义所在路由的路径为起点的相对路径，
   * 比如定义的是 './xxx' 当前路由的路径是 /a/b，那么最终访问的就是 '/a/b/xxx'
   * 虽然也可以定义为 /a/b/xxx 但是不推荐，因为你不知道当前模块一定在 /a/b 中使用
   */
  mapping?: {
    [key: string]: string;
  };
  /**
   * only works in mobile (web mobile or native mobile),
   * if set 'stack', it will use Staci.Navigator in native
   */
  transition?: 'stack';
  /**
   * works for createStackNavigator
   */
  navigatorOptions?: IObj;
  /**
   * works for Stack.Navigator
   */
  navigatorProps?: IObj;
  /**
   * only works in navtive platform, used in nested navigators, make navigate based on this navigators
   */
  baseScreenPath?: string[];
};

export class Router {
  @eject() routes: any[];
  @eject() options: any;

  constructor(options: IRouterOptions) {
    const { routes, ...opts } = options;
    this.routes = routes;
    this.options = opts;
    this.init();
  }

  init() {}

  /**
   * @param {string} url home/view1
   * @return {object|null} state, null means not find any route
   */
  parseUrlToState(url) {
    const { pathname, search } = parseUrl(url);
    const query = parseSearch(search);

    const params = {};
    let blocks = [];

    const isMatchWithEffect = (route, target) => {
      // if the given url is less than required, it does not match this route
      if (target.length < route.length) {
        return false;
      }

      blocks = [];
      for (let i = 0, len = route.length; i < len; i++) {
        const routeBlock = route[i];
        const targetBlock = target[i];

        // not equal at normal block
        if (routeBlock[0] !== ':' && routeBlock !== targetBlock) {
          return false;
        }

        if (routeBlock[0] === ':') {
          const key = routeBlock.substr(1);
          params[key] = targetBlock;
        }

        blocks.push(targetBlock);
      }

      return true;
    };

    const { routes } = this;
    const uriBlocks = pathname.split('/');

    let route;
    let index;
    let notFound;
    let defaultRoute;
    let redirect = '';
    for (let i = 0, len = routes.length; i < len; i++) {
      const item = routes[i];
      const { name, path = name, exact } = item;

      if (path === '') {
        index = item;
      } else if (path === '!') {
        notFound = item;
      }

      if (item.default) {
        defaultRoute = item;
      }

      // index route
      if (path === '' && pathname === '') {
        route = item;
        break;
      }

      const routePathBlocks = path.split('/');
      if (exact && routePathBlocks.length !== uriBlocks.length) {
        continue;
      }

      if (isMatchWithEffect(routePathBlocks, uriBlocks)) {
        route = item;
        break;
      }
    }

    // use defualt route as index
    if (!route && pathname === '' && defaultRoute) {
      route = defaultRoute;
      redirect = defaultRoute.path || defaultRoute.name;
    }

    // fallback to index
    if (!route && index && !index.exact) {
      route = index;
    }

    // not found
    if (!route) {
      const route = notFound || {
        path: '!',
        component: notFound ? notFound.component : () => null,
      };
      return {
        ...route,
        params: { ...query },
        url,
        pathname,
        search,
        query,
        route,
      };
    }

    // route params have higher priority then search query
    const combineParams = { ...query, ...params };
    const path = blocks.join('/');

    return {
      path,
      component: route.component,
      params: combineParams,
      url,
      pathname,
      search,
      query,
      redirect: redirect ? redirect : route.redirect,
      exact: route.exact,
      route,
    };
  }

  Link: ComponentType = Link.bind(this);
  useNavigate: typeof useRouteNavigate = useRouteNavigate.bind(this);
  useLocation: typeof useRouteLocation = useRouteLocation.bind(this);
  useParams: typeof useRouteParams = useRouteParams.bind(this);
  useMatch: typeof useRouteMatch = useRouteMatch.bind(this);
  usePrefetch: typeof useRoutePrefetch = useRoutePrefetch.bind(this);

  Outlet = (props) => {
    const forceUpdate = useForceUpdate();
    useHistoryListener(forceUpdate);

    const { initialUrl } = props;
    const { history, mode } = useContext(rootContext);
    const { abs, deep } = useContext(absContext);
    const { current: parent } = useContext(routerContext);

    const url = history.getUrl(abs, mode);
    const state = this.parseUrlToState(url);

    const { component: C, path, params, redirect, exact, route } = state;

    const { found: finalProps, notFound: propsNotFound } = findInfoByMapping(
      props,
      route.props
    );
    if (propsNotFound.length && process.env.NODE_ENV !== 'production') {
      console.error(
        `路由 ${abs}:${path} 组件未找到需要的props：${propsNotFound.join(',')}`
      );
    }

    const absInfo = useMemo(() => {
      const newAbs = resolveUrl(abs, path);
      const newDeep = [
        ...deep,
        { url, abs: newAbs, path, router: this, route, state },
      ];
      return {
        abs: newAbs,
        deep: newDeep,
      };
    }, [url]);

    const routeInfo = useMemo(
      () => ({
        abs,
        url,
        path,
        params,
        exact,
      }),
      [url]
    );

    const routerInfo = useMemo(
      () => ({
        abs,
        deep,
        current: this,
        parent,
      }),
      [abs]
    );

    const { mapping = {} } = this.options;
    const parentMapping = useContext(mappingContext) || [];
    const mapInfo = useMemo(
      () => [
        {
          abs: routerInfo.abs,
          mapping,
        },
        ...parentMapping,
      ],
      [parentMapping, routerInfo]
    );

    const { Provider: AbsProvider } = absContext;
    const { Provider: RouteProvider } = routeContext;
    const { Provider: RouterProvider } = routerContext;
    const { Provider: ParamsProvider } = paramsContext;
    const { Provider: MappingProvider } = mappingContext;

    const navigate = this.useNavigate();

    const inheritedParams = useContext(paramsContext);
    const basicParams = { ...params, ...inheritedParams };
    const { found: paramsFound, notFound: paramsNotFound } = findInfoByMapping(
      basicParams,
      route.params
    );
    const passDownParams = { ...basicParams, ...paramsFound };
    if (paramsNotFound.length && process.env.NODE_ENV !== 'production') {
      console.error(
        `路由 ${abs}:${path} 组件未找到需要的参数：${paramsNotFound.join(',')}`
      );
    }

    useEffect(() => {
      if (initialUrl) {
        const { pathname } = window.location;
        // 仅当在首页时才会跳转
        if (pathname === '/' || pathname === '') {
          navigate(initialUrl, null, true);
        }
        return;
      }

      if (redirect) {
        const redirectTo =
          typeof redirect === 'function' ? redirect(finalProps) : redirect;
        navigate(redirectTo, null, true);
      }
    }, [redirect, C, initialUrl]);

    if (redirect && !C) {
      return null;
    }

    return (
      <AbsProvider value={absInfo}>
        <RouterProvider value={routerInfo}>
          <RouteProvider value={routeInfo}>
            <MappingProvider value={mapInfo}>
              <ParamsProvider value={passDownParams}>
                {this.render(C, finalProps, {
                  forceUpdate,
                  url,
                  history,
                  mode,
                  path,
                  params,
                  abs,
                  deep,
                })}
              </ParamsProvider>
            </MappingProvider>
          </RouteProvider>
        </RouterProvider>
      </AbsProvider>
    );
  };

  protected render(C, props, _context?) {
    return <C {...props} />;
  }

  static $createLink?(info: any): any;

  static $createNavigate(
    history,
    getAbs,
    mode,
    _info
  ): (
    to: string | number,
    params?: object,
    type?: boolean | 'replace' | 'open'
  ) => void {
    return (
      to: string,
      params?: object,
      type?: boolean | 'replace' | 'open'
    ) => {
      if (typeof to === 'number') {
        to > 0 ? history.forword() : history.back();
        return;
      }
      const abs = getAbs(to, params);
      history.setUrl(to, abs, mode, params, type);
    };
  }

  static $createRootProvider(ctx, children, _options) {
    const { Provider } = rootContext;
    return <Provider value={ctx}>{children}</Provider>;
  }

  static $createPermanentNavigate(getPath, { history, mode }) {
    return (name, params = {}, type: boolean | 'replace' | 'open' = false) => {
      const path = getPath(name);

      if (!path) {
        return;
      }

      if (path === '.') {
        history.setUrl('.', null, null, params, type);
        return;
      }

      // 如果是函数，则直接执行该函数，在函数内实现跳转（为reactnative中用navigation进行跳转做准备）
      if (isFunction(path)) {
        path(params, type);
        return;
      }

      const args = { ...params };
      const items = path.split('/');
      const res = items.map((item) => {
        if (item[0] === ':') {
          const key = item.substring(1);
          if (params[key]) {
            delete args[key];
            return params[key];
          }
        }
        return item;
      });
      const pathStr = res.join('/');
      history.setUrl(pathStr, '/', mode, args, type);
    };
  }

  static $createPermanentLink(getPath) {
    return function (props) {
      const { to, params, ...attrs } = props;
      const path = getPath(to);

      if (!path || path === '.') {
        return <Link to="." params={params} {...attrs} />;
      }

      const args = { ...params };
      const items = path.split('/');
      const res = items.map((item) => {
        if (item[0] === ':') {
          const key = item.substring(1);
          if (params[key]) {
            delete args[key];
            return params[key];
          }
        }
        return item;
      });
      const href = res.join('/');
      return <Link to={href} {...attrs} />;
    };
  }
}

export function RouterRootProvider({ value, children }) {
  // this Provider can only be used once in one application
  const parent = useContext(rootContext);
  if (parent) {
    throw new Error(
      '[Nautil]: RouterRootProvider can only be used on your root application component with createBootstrap'
    );
  }

  const getMode = (mode) => {
    const createBase = (root) => root;

    if (mode.indexOf('/') === 0) {
      const root = mode === '/' ? '' : mode;
      const base = createBase(root);
      return { type: 'history', query: '', base };
    }

    if (mode.indexOf('#?') === 0) {
      const [query, root = ''] = mode.substring(2).split('=');
      const base = createBase(root);
      return { type: 'hash_search', query, base };
    }

    if (mode.indexOf('#') === 0) {
      const root = mode.substring(1);
      const base = createBase(root);
      return { type: 'hash', query: '', base };
    }

    if (mode.indexOf('?') === 0) {
      const [query, root = ''] = mode.substring(1).split('=');
      const base = createBase(root);
      return { type: 'search', query, base };
    }

    const base = createBase('');
    return { type: 'memo', query: '', base };
  };

  const ctx = useMemo(() => {
    const { mode } = value || {};
    const { type, query, base } = getMode(mode);
    const history = History.createHistory(type);
    return {
      history,
      mode: {
        type,
        query,
        base,
      },
      options: value,
    };
  }, [value]);

  const { Provider } = mappingContext;
  const map = useMemo(() => {
    const { options } = ctx;
    const { mapping } = options;
    return [
      {
        router: null,
        mapping,
      },
    ];
  }, [ctx]);

  return (
    <Provider value={map}>
      {Router.$createRootProvider(ctx, children, value)}
    </Provider>
  );
}

const createGetAbs = (inHost, abs, routerAbs, routeAbs, routeUrl) => (to) => {
  if (/^\.\.?\//.test(to)) {
    return [routeAbs, routeUrl].filter(Boolean).join('/');
  }
  if (inHost) {
    return abs;
  }
  return routerAbs;
};

const useGetAbs = (inHost) => {
  const { abs } = useContext(absContext);
  const { abs: currentRouterAbs = abs } = useContext(routerContext);
  const { abs: routeAbs, url } = useContext(routeContext);
  const getAbs = createGetAbs(inHost, abs, currentRouterAbs, routeAbs, url);
  return getAbs;
};

export function Link(props) {
  const { to, replace, open, params, ...attrs } = props;

  const forceUpdate = useForceUpdate();
  useHistoryListener(forceUpdate);

  const { history, mode } = useContext(rootContext);

  const navigateTo = useRouteNavigate.call(
    this && this instanceof Router ? this : null
  );
  const args = useShallowLatest(params);

  const getAbs = useGetAbs(this && this instanceof Router);
  const finalAbs = getAbs(to);

  const { href, navigate } = useMemo(() => {
    const href =
      typeof to === 'number' ? '#' : history.makeUrl(to, finalAbs, mode, args);
    const navigate = () => navigateTo(to, args, replace);
    return { href, navigate };
  }, [to, args, mode, replace, finalAbs, history]);

  return Router.$createLink({ ...attrs, href, open, navigate });
}

export function useRouteNavigate() {
  const forceUpdate = useForceUpdate();
  useHistoryListener(forceUpdate);

  const { history, mode } = useContext(rootContext);
  const { deep } = useContext(absContext);
  const { current: currentRouter } = useContext(routerContext);

  const inHost = this && this instanceof Router;
  const router = inHost ? this : currentRouter;

  const getAbs = useGetAbs(inHost);

  return Router.$createNavigate(history, getAbs, mode, {
    router,
    deep,
    inHost,
  });
}

/**
 * 提供一个更直接的回退hook函数，可以更简单的实现回退效果
 * @returns
 */
export function useRouteBack() {
  const navigate = useRouteNavigate();
  const history = useHistory();
  return (fallback?: string) => {
    // * @param fallback 当history中没有可以再回退的上一个页面时，会以fallback作为目标，避免点击后没有任何效果
    if (!history.stack?.length) {
      if (fallback) {
        navigate(fallback);
      } else {
        navigate('/');
      }
      return;
    }
    navigate(-1);
  };
}

export function useLocation() {
  const forceUpdate = useForceUpdate();
  useHistoryListener(forceUpdate);

  const { deep } = useContext(absContext);
  const { history } = useContext(rootContext);

  return {
    ...history.location,
    deep,
  };
}

export function useHistoryListener(fn) {
  const { history } = useContext(rootContext);
  useEffect(() => {
    history.on('change', fn);
    return () => history.off('change', fn);
  }, []);
}

export function useRouteParams() {
  const forceUpdate = useForceUpdate();
  useHistoryListener(forceUpdate);

  const { abs } = useContext(absContext);
  const { history, mode } = useContext(rootContext);
  const { params: routeParams } = useContext(routeContext);
  const inheritedParams = useContext(paramsContext);

  // top level use
  if (this && this instanceof Router) {
    const url = history.getUrl(abs, mode);
    const { params } = this.parseUrlToState(url);
    return { ...inheritedParams, ...params };
  }

  if (routeParams) {
    return { ...inheritedParams, ...routeParams };
  }

  return { ...inheritedParams };
}

export function useRouteMatch() {
  const forceUpdate = useForceUpdate();
  useHistoryListener(forceUpdate);

  const { abs } = useContext(absContext);
  const { history, mode } = useContext(rootContext);
  const { path: routePath, url, exact } = useContext(routeContext);

  let currentPath = '';
  let currentUrl = '';
  // top level use
  if (this && this instanceof Router) {
    const url = history.getUrl(abs, mode);
    const { path } = this.parseUrlToState(url);
    currentUrl = url;
    currentPath = path;
  } else if (routePath) {
    currentUrl = url;
    currentPath = routePath;
  }

  return (pattern: string | RegExp) => {
    if (pattern === currentPath) {
      return true;
    }

    if (pattern === '') {
      return exact ? currentPath === '' : currentPath !== '!';
    }

    if (
      !exact &&
      typeof pattern === 'string' &&
      `${currentUrl}/`.indexOf(pattern) === 0
    ) {
      return true;
    }

    if (pattern && pattern instanceof RegExp && pattern.test(currentUrl)) {
      return true;
    }

    return false;
  };
}
export function useRouteLocation<
  P extends string = string,
  PARAMS extends object = object
>(): {
  abs: string;
  deep: any[];
  path: P;
  params: PARAMS;
} {
  const forceUpdate = useForceUpdate();
  useHistoryListener(forceUpdate);

  const { path, params, url } = useContext(routeContext) as {
    path?: P;
    params?: PARAMS;
    url?: string;
  };
  const { abs, deep } = useContext(absContext);
  const { history, mode } = useContext(rootContext);

  const loc = {
    abs,
    deep,
    url,
    path,
    params,
  };

  if (this && this instanceof Router) {
    const url = history.getUrl(abs, mode);
    const { path, params } = this.parseUrlToState(url);
    Object.assign(loc, { path, params });
  }

  return loc;
}

/**
 * 基于route提前加载目标模块代码
 * @returns
 */
export function useRoutePrefetch() {
  const { current } = useContext(routerContext);

  /**
   * 目标路由path，注意，仅限当前路由内部的path，无法做到跨父级
   */
  return (to: string): void => {
    let foundComponent = null;

    if (this && this instanceof Router) {
      const state = this.parseUrlToState(to);
      const { component } = state;
      foundComponent = component;
    } else if (current && current instanceof Router) {
      const state = current.parseUrlToState(to);
      const { component } = state;
      foundComponent = component;
    }

    if (
      foundComponent &&
      isInheritedOf(foundComponent, Component) &&
      typeof foundComponent.meta?.source === 'function'
    ) {
      foundComponent.meta.source();
    }
  };
}

/**
 * @param path 路由路径
 * @param exact 是否精确匹配
 * @returns
 */
export function useRouteState(path: string, exact?: boolean) {
  const navigate = useRouteNavigate();
  const [prefix, ...rests] = path.split(/\/(?=:)/);
  const suffix = rests.join('/');
  const { path: routePath, url: routeUrl, params } = useContext(routeContext);

  const isActive = () => {
    // 直接""表示不跟随任何url段，但此时必须注意，如果exact为false的时候，表示永远匹配上了
    if (path === '' && exact) {
      return routePath === routeUrl;
    }
    const isEnd = new RegExp(`${createSafeExp(`/${prefix}`)}$`).test(routeUrl);
    if (routeUrl.indexOf(`/${prefix}/`) === -1 && !isEnd) {
      return false;
    }
    if (!suffix) {
      return true;
    }
    if (isEnd) {
      return false;
    }

    const matchedUrl = routeUrl.split(`/${prefix}/`).pop();

    const urlBlocks = matchedUrl.split('/');
    const pathBlocks = suffix.split('/');

    if (exact && urlBlocks.length !== pathBlocks.length) {
      return false;
    }

    if (urlBlocks.length < pathBlocks.length) {
      return false;
    }

    for (let i = 0, len = pathBlocks.length; i < len; i++) {
      const urlBlock = urlBlocks[i];
      const pathBlock = pathBlocks[i];

      if (pathBlock[0] === ':') {
        if (urlBlock === undefined) {
          return false;
        }
      } else if (urlBlock !== pathBlock) {
        return false;
      }
    }

    return true;
  };

  const setActive = (params?) => {
    // 注意，同一时间只能打开一个，即使参数不一样
    // 参数变化时，应该先关闭已经打开的，再使用新参数打开
    if (!isActive()) {
      navigate(`./${path}`, params);
    }
  };
  const setInactive = () => {
    const backUrl = routeUrl.split(`/${prefix}`).shift();
    navigate(backUrl, params, true);
  };

  return { isActive, setActive, setInactive };
}

export function Route(props) {
  const { path, exact, render, ...attrs } = props;
  const { isActive } = useRouteState(path, exact);
  return isActive() ? render(attrs) : null;
}

/**
 * 创建一个基于路由来决定组件是否渲染的组件
 * @examples
 * const { Component: MyComponent } = createRouteComponent('some', () => {})
 */
export function createRouteComponent<T = any>(
  path: string,
  create: (context: {
    useInactiveComponent: () => () => void;
    useActiveComponent: () => (params?: any) => void;
    useIsComponentActive: () => boolean;
    useComponentParams: () => IObj;
    Link: ComponentType<any>;
  }) => ComponentType<T>,
  exact?: boolean
): {
  useInactiveComponent: () => () => void;
  useActiveComponent: () => (params?: any) => void;
  useIsComponentActive: () => boolean;
  useComponentParams: () => IObj;
  Link: ComponentType<any>;
  Component: ComponentType<T>;
} {
  function useIsComponentActive() {
    const { isActive } = useRouteState(path, exact);
    return isActive();
  }

  function useActiveComponent() {
    const { setActive } = useRouteState(path, exact);
    return setActive;
  }

  function useInactiveComponent() {
    const { setInactive } = useRouteState(path, exact);
    return setInactive;
  }

  function useComponentParams() {
    const isActive = useIsComponentActive();
    const { url } = useContext(routeContext);

    if (!isActive) {
      return {};
    }

    const [prefix, ...rests] = path.split(/\/(?=:)/);
    const suffix = rests.join('/');

    if (!suffix) {
      return {};
    }

    const foundUrl = url.split(`/${prefix}/`).pop();

    const params = {};
    const urlBlocks = foundUrl.split('/');
    const pathBlocks = suffix.split('/');
    for (let i = 0, len = pathBlocks.length; i < len; i++) {
      const urlBlock = urlBlocks[i];
      const pathBlock = pathBlocks[i];
      if (pathBlock[0] === ':') {
        const key = pathBlock.substring(1);
        params[key] = urlBlock;
      }
    }
    return params;
  }

  function Link(props) {
    return <Link {...props} to={`./${path}`} />;
  }

  const C = create({
    useInactiveComponent,
    useActiveComponent,
    Link,
    useIsComponentActive,
    useComponentParams,
  });
  function Component(props) {
    return <C {...props} />;
  }

  return {
    useInactiveComponent,
    useActiveComponent,
    Link,
    useIsComponentActive,
    Component,
    useComponentParams,
  };
}

function usePermanentGetPath() {
  const mapping = useContext(mappingContext);

  const getPath = (name) => {
    if (name === '.') {
      return '.';
    }

    if (/[.|/]+/.test(name)) {
      const items = name.split('/');
      if (items[0] === '.') {
        if (items.length === 1) {
          return '.';
        }
        items.shift();
      }
      const count = items.length;
      const target = mapping[count];
      if (!target) {
        return '/';
      }
      return target.abs || '/';
    }

    const item = mapping.find((item) => item.mapping?.[name]);
    if (!item) {
      console.error(`全局路由 ${name} 未定义`);
      return;
    }

    const { abs } = item;
    const nav = item.mapping[name];
    const path = resolveUrl(abs, nav);
    return path;
  };
  return getPath;
}

/**
 * 基于全局注册的路由进行跳转
 * @returns
 */
export function usePermanentNavigate() {
  const { history, mode } = useContext(rootContext);
  const getPath = usePermanentGetPath();
  return Router.$createPermanentNavigate(getPath, { history, mode });
}

export function usePermanentLink() {
  const getPath = usePermanentGetPath();
  return Router.$createPermanentLink(getPath);
}

export function useHistory() {
  const { history } = useContext(rootContext);
  return history;
}
