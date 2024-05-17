import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import type { Options, Service } from '../types';
import { request } from './utils';

describe('useRetryPlugin', () => {
  jest.useFakeTimers();
  jest.setTimeout(1000 * 10);

  const setUp = (options: Options<any, any[]>, service: Service<any, any[]> = request) =>
    renderHook((o?: Options<any, any[]>) => useRequest(service, o || (options as any)));

  let hook: ReturnType<typeof setUp>;
  it('useRetryPlugin should work fine', async () => {
    let errorCallback;
    act(() => {
      errorCallback = jest.fn();
      hook = setUp(
        {
          retryCount: 3,
          onError: errorCallback,
        },
        () => request(0),
      );
    });

    jest.advanceTimersByTime(500);

    expect(errorCallback).toHaveBeenCalledTimes(0);
    jest.runAllTimers();
    await hook.waitForNextUpdate();
    expect(errorCallback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(errorCallback).toHaveBeenCalledTimes(2);

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(errorCallback).toHaveBeenCalledTimes(3);

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(errorCallback).toHaveBeenCalledTimes(4);

    act(() => {
      jest.runAllTimers();
    });
    expect(errorCallback).toHaveBeenCalledTimes(4);
    hook.unmount();
  });

  it('useRetryPlugin onSuccess should reset retryCount', async () => {
    const errorCallback = jest.fn();
    const successCallback = jest.fn();
    hook = setUp({
      retryCount: 1,
      onError: errorCallback,
      defaultParams: [0],
    });

    expect(errorCallback).toBeCalledTimes(0);
    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(errorCallback).toBeCalledTimes(1);

    hook.rerender({
      retryCount: 1,
      onError: errorCallback,
      defaultParams: [1],
      manual: true,
      onSuccess: successCallback,
    });
    act(() => {
      hook.result.current.run();
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(successCallback).toBeCalledTimes(1);
    hook.rerender({
      retryCount: 1,
      onError: errorCallback,
      defaultParams: [0],
      onSuccess: successCallback,
    });

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(errorCallback).toBeCalledTimes(2);

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(errorCallback).toBeCalledTimes(3);

    act(() => {
      jest.runAllTimers();
    });
    expect(errorCallback).toBeCalledTimes(3);
  });

  it('useRetryPlugin cancel should work fine', async () => {
    const errorCallback = jest.fn();
    act(() => {
      hook = setUp({
        onError: errorCallback,
        retryCount: 3,
        defaultParams: [0],
      });
    });

    jest.advanceTimersByTime(900);
    expect(errorCallback).toHaveBeenCalledTimes(0);
    jest.runAllTimers();
    await hook.waitForNextUpdate();
    expect(errorCallback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.runAllTimers();
    });
    await hook.waitForNextUpdate();
    expect(errorCallback).toHaveBeenCalledTimes(2);

    act(() => {
      hook.result.current.cancel();
    });
    jest.runAllTimers();
    expect(errorCallback).toHaveBeenCalledTimes(2);
    hook.unmount();
  });
});
