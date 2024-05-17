import { act, renderHook } from '@testing-library/react-hooks';
import MockDate from 'mockdate';
import { useRequest, clearCache } from '../use-request';
import type { Options, Service } from '../types';
import { request } from './utils';

import 'jest-localstorage-mock';

const setUp = (options: Options<any, any>, service: Service<any, any> = request) =>
  renderHook((o?: Options<any, any>) => useRequest(service, o ?? options));

let hook: ReturnType<typeof setUp>;

afterEach(() => {
  MockDate.reset();
  hook?.unmount?.();
  clearCache();
});

describe('useCachePlugin', () => {
  jest.useFakeTimers();

  const cacheKey = 'testCacheKey';

  it('useRequest cache should work fine', async () => {
    MockDate.set(0);
    hook = setUp({
      cacheKey,
    });
    expect(hook.result.current.loading).toEqual(true);
    jest.runAllTimers();
    await hook.waitForNextUpdate();
    expect(hook.result.current.loading).toEqual(false);
    expect(hook.result.current.data).toEqual('success');
    MockDate.set(1000);
    hook.unmount();
    hook = setUp({
      cacheKey,
    });
    expect(hook.result.current.loading).toEqual(true);
    expect(hook.result.current.loaded).toEqual(false);
    expect(hook.result.current.data).toEqual('success');
    jest.runAllTimers();
    await hook.waitForNextUpdate();
    expect(hook.result.current.loading).toEqual(false);
  });

  it('useRequest staleTime should work fine', async () => {
    MockDate.set(0);
    hook = setUp({
      cacheKey,
    });
    expect(hook.result.current.loading).toEqual(true);
    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(hook.result.current.data).toEqual('success');
    expect(hook.result.current.loading).toEqual(false);
    hook.unmount();

    MockDate.set(2000);
    jest.advanceTimersByTime(2000);
    hook = setUp({
      cacheKey,
      staleTime: 3000,
    });
    expect(hook.result.current.loading).toEqual(false);
    expect(hook.result.current.loaded).toEqual(true);
    expect(hook.result.current.data).toEqual('success');
    hook.unmount();

    MockDate.set(3001);
    jest.advanceTimersByTime(1001);
    hook = setUp({
      cacheKey,
      staleTime: 3000,
    });
    expect(hook.result.current.loading).toEqual(true);
    expect(hook.result.current.loaded).toEqual(false);
    expect(hook.result.current.data).toEqual('success');
    jest.runAllTimers();
    await hook.waitForNextUpdate();
    expect(hook.result.current.loading).toEqual(false);
  });

  it('useRequest cacheTime should work fine', async () => {
    jest.setTimeout(10 * 1000);
    MockDate.set(0);
    hook = setUp({
      cacheKey,
      cacheTime: 5000,
    });
    expect(hook.result.current.loading).toEqual(true);
    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(hook.result.current.data).toEqual('success');
    hook.unmount();

    act(() => {
      MockDate.set(1000);
      jest.advanceTimersByTime(1000);
    });

    hook = setUp(
      {
        cacheKey,
        cacheTime: 5000,
      },
      () => request(' hook2'),
    );
    expect(hook.result.current.data).toEqual('success');
    expect(hook.result.current.loading).toEqual(true);
    expect(hook.result.current.loaded).toEqual(false);
    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(hook.result.current.data).toEqual('success hook2');
    hook.unmount();

    MockDate.set(6001);
    jest.advanceTimersByTime(6001);
    hook = setUp({
      cacheKey,
      cacheTime: 5000,
    });
    expect(hook.result.current.loading).toEqual(true);
    expect(hook.result.current.data).toEqual(undefined);
    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(hook.result.current.loading).toEqual(false);
    expect(hook.result.current.data).toEqual('success');
  });

  it('clearCache should work fine', async () => {
    hook = setUp({
      cacheKey,
      cacheTime: 5000,
    });

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(hook.result.current.data).toEqual('success');
    hook.unmount();

    clearCache();
    hook = setUp({
      cacheKey,
      cacheTime: 5000,
    });
    expect(hook.result.current.data).toEqual(undefined);
  });

  it('setCache/getCache should work fine', async () => {
    const map = new Map<string, any>();
    const setCache = (key, data) => map.set(key, data);
    const getCache = (key) => map.get(key);

    hook = setUp({
      cacheKey,
      setCache,
      getCache,
    });

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(hook.result.current.loading).toEqual(false);
    expect(hook.result.current.data).toEqual('success');
    hook.unmount();

    hook = setUp({
      cacheKey,
      setCache,
      getCache,
    });
    expect(hook.result.current.data).toEqual('success');
  });

  it('onMutate should work fine', async () => {
    MockDate.set(0);
    hook = setUp({
      cacheKey,
      cacheTime: 5000,
      manual: true,
    });
    expect(hook.result.current.loading).toEqual(false);

    act(() => {
      hook.result.current.mutate('success hook');
    });

    expect(hook.result.current.data).toEqual('success hook');

    hook.unmount();
    MockDate.set(1000);
    jest.advanceTimersByTime(1000);

    hook = setUp({
      cacheKey,
      cacheTime: 5000,
    });
    expect(hook.result.current.loading).toEqual(true);
    expect(hook.result.current.data).toEqual('success hook');

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(hook.result.current.data).toEqual('success');
  });
});
