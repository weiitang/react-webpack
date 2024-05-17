import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import { request } from './utils';

describe('useThrottlePlugin', () => {
  jest.useFakeTimers();

  it('useThrottlePlugin should work fine', async () => {
    const fn = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(
        (n: number) => {
          fn();
          return request(n);
        },
        {
          throttleWait: 100,
          manual: true,
          throttleTrailing: false,
        },
      ),
    );

    expect(fn).toBeCalledTimes(0);

    act(() => {
      result.current.run(1);
      expect(fn).toBeCalledTimes(1);
      jest.advanceTimersByTime(50);
      result.current.run(2);
      expect(fn).toBeCalledTimes(1);
      jest.advanceTimersByTime(50);
      result.current.run(3);
      expect(fn).toBeCalledTimes(2);
      jest.advanceTimersByTime(50);
      result.current.run(4);
      expect(fn).toBeCalledTimes(2);
      jest.advanceTimersByTime(50);
    });
    act(() => {
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(fn).toBeCalledTimes(2);
  });
});
