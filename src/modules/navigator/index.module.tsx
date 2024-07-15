import { importModule, Router } from '@core';

// 需要一个history的上下文
import { createBootstrap } from '@core';

const { Outlet } = new Router({
  routes: [
    {
      path: '',
      component: importModule({
        source: () => import('.'),
      }),
    },
    {
      path: 'navigator-test',
      component: importModule({
        source: () => import('.'),
      }),
    },
    {
      path: 'navigator-router',
      component: importModule({
        source: () => import('./test-router'),
      }),
    },
    {
      path: 'navigator-params/:id',
      component: importModule({
        source: () => import('./test-params'),
      }),
    },
  ],
});

const OutletWarp = () => {
  return (
    <div>
      <div>测试测试测试</div>
      <Outlet></Outlet>
    </div>
  );
};

const OutletNavigator = importModule({
  // 需要将 路由export default
  source: () => import('./index.module'),
});

const bootstrap = createBootstrap({
  router: {
    mode: '/',
  },
});

export const OutletTest = Outlet;
export const RootOutlet = bootstrap(Outlet);
export const RootOutletNavigator = bootstrap(OutletNavigator);

export const RootOutletWarp = bootstrap(OutletWarp);

export function navigator() {
  return [{ title: '路由', path: false }, { title: 'Test' }];
}

export default Outlet;
