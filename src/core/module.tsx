/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext, useMemo, useRef } from 'react';
import { Ty, ifexist, eject, Enum } from 'tyshemo';
import { useShallowLatest } from '@src/hook';
import type { IObj } from '@src/typings/type';
import { Component } from './component';
import {
  RouterRootProvider,
  useRouteLocation,
  useRouteParams,
} from './router/router';
import { findInfoByMapping } from './utils/utils';

type IBootstrapOptions = {
  /**
   * 路由配置
   */
  router: {
    /**
     * 路由模式
     */
    mode: string;
    /**
     * 全局路由定义地图
     * @example
     * { INVESTMENT_PIPELINE_DETAIL: '/investment-pipeline/detail/:id' }
     * // 需要使用的地方：
     * const navigate = usePermanentNavigate()
     * navigate('INVESTMENT_PIPELINE_DETAIL', { id: 111 })
     */
    mapping?: {
      [key: string]: string;
    };
    /**
     * only works in native platform, whether to use NavigationContainer to wrap in bootstrap,
     * if you set false, you should must import { NavigationContainer } from 'react-nativation' to wrap your application
     */
    ignoreNavigationContainer?: boolean;
    /**
     * only works in navtive platform, used in nested navigators, make navigate based on this navigators
     */
    rootScreenPath?: string[];
    /**
     * works for NavigationContainer
     */
    navigationContainerProps?: IObj;
  };
  context?: IObj;
};

const bootstrapperContext = createContext(null);
export function createBootstrap(options: IBootstrapOptions) {
  const { router, context = {} } = options;

  function Root(props) {
    const { children } = props;
    const parent = useContext(bootstrapperContext);
    if (parent) {
      throw new Error(
        'You should must use createBootstrap for your root application component only once.'
      );
    }

    const { Provider } = bootstrapperContext;
    return (
      <Provider value={context}>
        <RouterRootProvider value={router}>{children}</RouterRootProvider>
      </Provider>
    );
  }

  function bootstrap(C) {
    return function Bootstrapper(props) {
      return (
        <Root>
          <C {...props} />
        </Root>
      );
    };
  }

  bootstrap.Root = Root;

  return bootstrap;
}

const navigatorContext = createContext([]);
const contextContext = createContext({});
const paramsContext = createContext({});

export function importModule(options) {
  const {
    prefetch,
    source,
    pending,
    name,
    navigator: needNavigator = true,
    context: sharedContext = {},
    ready: needReady = true,
  } = options;

  let loadedComponent = null;
  let loadedNavigator = null;
  let loadedContext = null;
  let loadedReady = null;
  let loadedParams = null;

  class ModuleComponent extends Component {
    state = {
      component: loadedComponent,
      navigator: loadedNavigator,
      context: loadedContext,
      ready: loadedReady,
      params: loadedParams,
    };

    prefetchLinks = [];

    @eject()
    private name: string;

    __init() {
      if (name) {
        this.name = name;
      }
    }

    componentDidMount() {
      if (!loadedComponent) {
        // 拉取组件
        Promise.resolve(
          typeof source === 'function' ? source(this.props) : source
        ).then((mod) => {
          const { default: component, navigator, context, ready, params } = mod;
          loadedComponent = component;
          loadedNavigator = navigator;
          loadedContext = context;
          loadedReady = ready;
          loadedParams = params;
          this.setState({ component, navigator, context, ready, params });
        });
        // 预加载
        if (prefetch && document) {
          const urls = prefetch(this.props);
          urls.forEach((url) => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'fetch';
            link.href = url;
            document.head.appendChild(link);
            this.prefetchLinks.push(link);
          });
        }
      }
    }

    componentWillUnmount() {
      if (this.prefetchLinks.length && document) {
        this.prefetchLinks.forEach((link) => {
          document.head.removeChild(link);
        });
      }
    }

    Within = () => {
      // compute current module navigator
      const previousNaivgators = useContext(navigatorContext);
      const previous = useShallowLatest(previousNaivgators);
      const {
        component,
        navigator: useThisNavigator,
        context: useThisContext,
        ready: useThisReady,
        params: useThisParams,
      } = this.state;

      const info = useRef({
        navigator: [],
        context: {},
        params: {},
        props: this.props,
      });

      const { abs, deep } = useRouteLocation();

      const paramsMapping = useThisParams ? useThisParams(info.current) : {};
      const routeParams = useRouteParams();
      const { found: paramsFound, notFound: paramsNotFound } =
        findInfoByMapping(routeParams, paramsMapping);
      const params = { ...routeParams, ...paramsFound };
      if (paramsNotFound.length && process.env.NODE_ENV !== 'production') {
        console.error(
          `模块 ${deep
            .map((item) => item.path)
            .join(':')} 未找到需要的参数：${paramsNotFound.join(',')}`
        );
      }
      info.current.params = params;

      // compute current module context
      const rootContext = useContext(bootstrapperContext);
      // @ts-ignore
      const thisContext = useThisContext ? useThisContext(info.current) : {};
      const parentContext = useContext(contextContext);
      const context = {
        ...rootContext,
        ...sharedContext,
        ...parentContext,
        ...thisContext,
      };
      const ctx = useShallowLatest(context);
      info.current.context = ctx;

      const navi = useThisNavigator ? useThisNavigator(info.current) : null;
      const nav = useShallowLatest(navi);
      const navs = useMemo(() => {
        if (!nav) {
          return [];
        }
        const navs = [].concat(nav);
        return navs.map((nav) => {
          if (typeof nav.path === 'undefined') {
            return {
              path: abs || '/',
              ...nav,
            };
          }
          return nav;
        });
      }, [nav, abs]);
      const navigator = useMemo(() => [...previous, ...navs], [navs, previous]);
      info.current.navigator = navigator;

      // deal with ready
      const ready =
        useThisReady && needReady ? useThisReady(info.current) : true;
      if (!ready && !pending) {
        return null;
      }
      if (!ready && pending) {
        return pending(this.props);
      }

      const { Provider: NavigatorProvider } = navigatorContext;
      const { Provider: ContextProvider } = contextContext;
      const { Provider: ParamsProvider } = paramsContext;

      const LoadedComponent = component;

      const render = () => (
        <ContextProvider value={ctx}>
          <ParamsProvider value={params}>
            <LoadedComponent {...this.props} />
          </ParamsProvider>
        </ContextProvider>
      );

      if (!needNavigator) {
        return render();
      }

      return (
        <NavigatorProvider value={navigator}>{render()}</NavigatorProvider>
      );
    };

    render() {
      const { component } = this.state;

      if (!component && !pending) {
        return null;
      }

      if (!component && pending) {
        return pending(this.props);
      }

      const { Within } = this;
      return <Within />;
    }

    static readonly meta = {
      prefetch,
      source,
      name,
    };
  }

  return ModuleComponent;
}

export function createAsyncComponent(source) {
  return importModule({ source, navigator: false });
}

export function useModuleNavigator() {
  const navigators = useContext(navigatorContext);
  if (process.env.NODE_ENV !== 'production') {
    Ty.expect(navigators).to.be([
      {
        title: ifexist(String),
        path: new Enum([String, false]),
      },
    ]);
  }
  return navigators;
}

export function useModuleContext(): any {
  const ctx = useContext(contextContext);
  return ctx;
}

export function useModuleParams(): any {
  const params = useContext(paramsContext);
  return params;
}
