import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import type { Options, Service } from '../types';
import { request } from './utils';

describe('useDebouncePlugin', () => {
  jest.useFakeTimers();
  const setUp = (options: Options<any, any>, service: Service<any, any> = request) =>
    renderHook((o?: Options<any, any>) => useRequest(service, o ?? options));

  let hook: ReturnType<typeof setUp>;

  it('useDebouncePlugin should work fine', async () => {
    const fn = jest.fn();
    hook = setUp(
      {
        manual: true,
        debounceWait: 100,
      },
      () => {
        fn();
        return request();
      },
    );

    const { result } = hook;

    act(() => {
      result.current.run(1);
      jest.advanceTimersByTime(50);
      result.current.run(2);
      jest.advanceTimersByTime(50);
      result.current.run(3);
      jest.advanceTimersByTime(50);
      result.current.run(4);
    });

    act(() => {
      jest.runAllTimers();
    });

    await hook.waitForNextUpdate();
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      hook.result.current.run(1);
      jest.advanceTimersByTime(50);
      hook.result.current.run(2);
      jest.advanceTimersByTime(50);
      hook.result.current.run(3);
      jest.advanceTimersByTime(50);
      hook.result.current.run(4);
    });

    act(() => {
      jest.runAllTimers();
    });

    await hook.waitForNextUpdate();
    expect(fn).toHaveBeenCalledTimes(2);

    act(() => {
      hook.result.current.run(1);
      jest.advanceTimersByTime(50);
      hook.result.current.run(2);
      jest.advanceTimersByTime(50);
      hook.result.current.cancel();
    });

    act(() => {
      jest.runAllTimers();
    });
    expect(fn).toHaveBeenCalledTimes(2);

    hook.unmount();
  });
});
