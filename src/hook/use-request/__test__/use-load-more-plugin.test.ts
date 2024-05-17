import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import type { IPagination } from '../../../typings/pagination';

const mockTotal = 23;

interface RequestParams extends Pick<IPagination, 'current' | 'size'> {
  error?: boolean;
}
function request(
  requestParams: RequestParams = {
    current: 1,
    size: 10,
  },
): Promise<IPagination> {
  const { current, size, error } = requestParams;
  const records: number[] = [];
  for (let i = (current - 1) * size; i < current * size; i++) {
    records.push(i);
  }
  const responseData: IPagination = {
    current,
    size,
    pages: Math.ceil(mockTotal / size),
    total: mockTotal,
    records,
  };
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) reject(new Error('error'));
      else resolve(responseData);
    }, 1000);
  });
}

describe('useLoadMorePlugin', () => {
  jest.useFakeTimers();

  it('loadMore should work fine', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(request, {
        manual: true,
        defaultParams: [
          {
            current: 1,
            size: 10,
          },
        ],
      }),
    );
    expect(result.current.loading).toEqual(false);

    function checkPages(params) {
      expect(result.current.data).toEqual(
        expect.objectContaining({
          pages: Math.ceil(mockTotal / 10),
          total: mockTotal,
          size: 10,
          ...params,
        }),
      );
    }

    act(() => {
      result.current.run();
      jest.runAllTimers();
    });

    expect(result.current.loadingMore).toEqual(false);
    await waitForNextUpdate();
    checkPages({
      current: 1,
    });

    act(() => {
      result.current.loadMore();
      jest.runAllTimers();
    });
    expect(result.current.loadingMore).toEqual(true);
    await waitForNextUpdate();
    checkPages({
      current: 2,
    });
    expect(result.current.loadingMore).toEqual(false);
    expect(result.current.complete).toEqual(false);

    act(() => {
      result.current.loadMore();
      jest.runAllTimers();
    });
    expect(result.current.loadingMore).toEqual(true);
    await waitForNextUpdate();
    checkPages({
      current: 3,
    });
    expect(result.current.loadingMore).toEqual(false);
    expect(result.current.complete).toEqual(true);

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.loadingMore).toEqual(false);
  });

  it('customComplete should work fine', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(request, {
        manual: true,
        customComplete() {
          return true;
        },
        defaultParams: [
          {
            current: 1,
            size: 10,
          },
        ],
      }),
    );

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.loading).toEqual(true);
    expect(result.current.complete).toEqual(false);
    act(() => {
      jest.runAllTimers();
    });
    await waitForNextUpdate();

    expect(result.current.loading).toEqual(false);
    expect(result.current.complete).toEqual(true);
    act(() => {
      result.current.loadMore();
    });
    expect(result.current.loading).toEqual(false);
    expect(result.current.loadingMore).toEqual(false);
  });

  it('customLoadMoreParams should work fine', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(request, {
        defaultParams: [
          {
            current: 1,
            size: 10,
          },
        ],
        customLoadMoreParams(params) {
          if (!params?.[0]) return params;
          params[0].current += 2;
          params[0].size = 20;
          return params;
        },
      }),
    );

    expect(result.current.loading).toEqual(true);
    act(() => {
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 1,
        size: 10,
      }),
    );

    act(() => {
      result.current.loadMore();
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.loadingMore).toEqual(false);
    expect(result.current.complete).toEqual(true);
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 3,
        size: 20,
      }),
    );
  });

  it('loadMore refresh should work fine', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(request, {
        defaultParams: [
          {
            current: 1,
            size: 20,
          },
        ],
      }),
    );

    act(() => {
      jest.runAllTimers();
    });
    await waitForNextUpdate();

    act(() => {
      result.current.loadMore();
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 2,
        size: 20,
      }),
    );
    expect(result.current.complete).toEqual(true);

    act(() => {
      result.current.refresh();
    });
    expect(result.current.refreshing).toEqual(true);
    act(() => {
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.refreshing).toEqual(false);
    expect(result.current.complete).toEqual(false);
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 1,
        size: 20,
      }),
    );

    act(() => {
      result.current.loadMore();
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 2,
        size: 20,
      }),
    );
    expect(result.current.complete).toEqual(true);
  });

  // 业务强耦合
  it('loadMore records should work fine', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(request, {
        manual: true,
      }),
    );

    act(() => {
      result.current.run({
        current: 1,
        size: 10,
      });
    });

    expect(result.current.loading).toEqual(true);
    act(() => {
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 1,
        size: 10,
        records: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      }),
    );

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.loading).toEqual(true);
    expect(result.current.loadingMore).toEqual(true);
    act(() => {
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
    expect(result.current.loadingMore).toEqual(false);
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 2,
        size: 10,
        records: new Array(20).fill(0).map((v, i) => i),
      }),
    );

    act(() => {
      result.current.loadMore();
    });
    jest.advanceTimersByTime(400);
    act(() => {
      result.current.cancel();
    });
    expect(result.current.loading).toEqual(false);
    expect(result.current.loadingMore).toEqual(false);
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 2,
        size: 10,
        records: new Array(20).fill(0).map((v, i) => i),
      }),
    );

    act(() => {
      result.current.run({
        current: 1,
        size: 10,
      });
    });
    jest.advanceTimersByTime(400);
    act(() => {
      result.current.cancel();
    });
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 2,
        size: 10,
        records: new Array(20).fill(0).map((v, i) => i),
      }),
    );

    act(() => {
      result.current.run({
        current: 1,
        size: 10,
      });
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.data).toEqual(
      expect.objectContaining({
        current: 1,
        size: 10,
        records: new Array(10).fill(0).map((v, i) => i),
      }),
    );
  });

  // 业务耦合

  it('loadMore params should contain current', async () => {
    const { result } = renderHook(() =>
      useRequest(request, {
        manual: true,
      }),
    );

    expect(() => result.current.loadMore()).rejects.toThrow('loadMorePlugin params error');
  });
});
