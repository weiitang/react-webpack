import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import { request } from './utils';

jest.useFakeTimers();

describe('useRequest', () => {
  it('mutate should work fine', async () => {
    const { result } = renderHook(() =>
      useRequest(request, {
        manual: true,
      }),
    );

    expect(result.current.loading).toEqual(false);
    expect(result.current.loaded).toEqual(false);
    expect(result.current.data).toEqual(undefined);

    act(() => {
      result.current.mutate('response data');
    });
    expect(result.current.loading).toEqual(false);
    expect(result.current.loaded).toEqual(true);
    expect(result.current.data).toEqual('response data');

    act(() => {
      result.current.mutate(() => 'function');
    });
    expect(result.current.data).toEqual('function');
  });

  it('useRequest request error should return a Promise', async () => {
    const errorCallback = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(() => request(0), {
        manual: true,
        onError: errorCallback,
      }),
    );

    act(() => {
      result.current.run();
      result.current.run();
    });

    jest.runAllTimers();
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
    expect(errorCallback).toBeCalledTimes(1);
  });
});
