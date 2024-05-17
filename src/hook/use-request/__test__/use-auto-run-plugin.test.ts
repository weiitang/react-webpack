import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import { request } from './utils';
import type { Options, Service, Plugin } from './../types';

jest.useFakeTimers();
const setUp = (options: Options<any, any> = {}, service: Service<any, any> = request) =>
  renderHook((o: Options<any, any>) => useRequest(service, o ?? options));
let hook: ReturnType<typeof setUp>;

afterEach(() => {
  hook?.unmount();
});

describe('useAutoRunPlugin', () => {
  const isLoading = (h = hook) => {
    expect(hook.result.current.loading).toBeTruthy();
  };

  const isLoaded = (h = hook) => {
    expect(hook.result.current.loaded).toBeTruthy();
    expect(hook.result.current.loading).toBeFalsy();
  };

  const unReady = (h = hook) => {
    expect(hook.result.current.loading).toBeFalsy();
    expect(hook.result.current.loaded).toBeFalsy();
  };

  const run = async (h = hook) => {
    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
  };

  it('autoRun should work fine', async () => {
    act(() => {
      hook = setUp();
    });
    isLoading();
    await run();
    isLoaded();
  });

  it('ready=false should work fine', async () => {
    act(() => {
      hook = setUp({
        ready: false,
        manual: false,
      });
    });

    const { result } = hook;
    expect(result.current.loading).toEqual(false);

    hook.rerender({
      ready: true,
      manual: false,
    });
    expect(result.current.loading).toEqual(true);

    await run();
    expect(result.current.loaded).toEqual(true);
    expect(result.current.loading).toEqual(false);

    hook.rerender({
      ready: true,
      manual: true,
    });
    expect(result.current.loading).toEqual(false);

    hook.rerender({
      ready: false,
      manual: true,
    });
    expect(result.current.loading).toEqual(false);

    hook.rerender({
      ready: false,
      manual: false,
    });
    expect(result.current.loading).toEqual(false);
  });

  it('manual=true should work fine', async () => {
    const fn = jest.fn();
    const args = [{ name: 'jsonz' }, 1];
    act(() => {
      hook = setUp({
        manual: true,
        onFinally(params) {
          fn(...params);
        },
      });
    });

    unReady();
    act(() => {
      hook.result.current.run(...args);
    });
    isLoading();
    await run();
    isLoaded();
    expect(fn).toBeCalledTimes(1);
    expect(fn.mock.calls).toEqual([args]);
  });

  it('refreshDeps && refreshDepsAction should work fine', async () => {
    let dep = 1;
    const fn = jest.fn();
    const fn2 = jest.fn();
    act(() => {
      hook = setUp({
        refreshDeps: [dep],
        onSuccess: fn,
        refreshDepsAction: fn2,
      });
    });

    // 初始run
    const { result } = hook;
    expect(result.current.loading).toEqual(true);
    await run();
    expect(result.current.loaded).toEqual(true);
    expect(result.current.loading).toEqual(false);
    expect(hook.result.current.refreshing).toEqual(false);
    expect(fn).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(0);

    // refreshDepsAction
    dep = 2;
    hook.rerender({
      refreshDeps: [dep],
      onSuccess: fn,
      refreshDepsAction: fn2,
    });
    expect(hook.result.current.loading).toEqual(false);
    expect(hook.result.current.refreshing).toEqual(true);
    await run();
    expect(hook.result.current.refreshing).toEqual(false);
    expect(fn).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(1);

    // !refreshDepsAction
    hook.rerender({
      refreshDeps: [3],
      onSuccess: fn,
    });
    isLoading();
    await run();
    expect(fn).toBeCalledTimes(2);
    expect(fn2).toBeCalledTimes(1);
  });

  it('defaultParams should work fine', async () => {
    const defaultParams = [{ name: 'jsonz' }, 1];
    const fn = jest.fn();
    act(() => {
      hook = setUp(
        {
          defaultParams,
        },
        (...arg) => {
          fn(...arg);
          return request();
        },
      );
    });

    await run();
    expect(fn.mock.calls).toEqual([defaultParams]);
  });

  it('manual=true refreshDeps should work fine', async () => {
    const fn = jest.fn();
    act(() => {
      hook = setUp({
        manual: true,
        refreshDeps: [1],
        refreshDepsAction: fn,
      });
    });
    unReady();
    hook.rerender({
      manual: true,
      refreshDeps: [2],
      refreshDepsAction: fn,
    });
    unReady();

    hook.rerender({
      manual: false,
      refreshDeps: [2],
      refreshDepsAction: fn,
    });
    isLoading();
    await run();
    isLoaded();
  });

  it('useAutoRunPlugin ready && refreshDeps change same time work fine', async () => {
    const fn = jest.fn();
    act(() => {
      hook = setUp(
        {
          ready: false,
          refreshDeps: [1],
        },
        () => {
          fn();
          return request();
        },
      );
    });

    unReady();
    hook.rerender({
      ready: true,
      refreshDeps: [2],
    });
    await run();
    isLoaded();
    expect(fn).toBeCalledTimes(1);
  });

  it('initializeLoading should work fine', async () => {
    const hook = renderHook((o: Options<any, any>) =>
      useRequest(
        request,
        o ?? {
          initializeLoading: true,
          manual: true,
          ready: false,
        },
      ),
    );

    expect(hook.result.current.loading).toEqual(false);

    hook.rerender({
      initializeLoading: true,
      ready: true,
      manual: true,
    });
    expect(hook.result.current.loading).toEqual(true);
  });
});
