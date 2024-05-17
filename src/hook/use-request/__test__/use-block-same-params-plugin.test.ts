import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import { requestAny } from './utils';

jest.useFakeTimers();

describe('useBlockSameParamsPlugin', () => {
  it('blockSameParams should work fine', async () => {
    const fn = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(requestAny, {
        blockSameParams: true,
        manual: true,
        onFinally() {
          fn();
        },
      }),
    );

    act(() => {
      result.current.run(1);
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    act(() => {
      result.current.run(2);
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
    expect(fn).toBeCalledTimes(2);

    act(() => {
      result.current.run(2);
      jest.runAllTimers();
    });
    expect(fn).toBeCalledTimes(2);

    act(() => {
      result.current.run(3);
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(fn).toBeCalledTimes(3);
  });

  it('blockSameParamsIgnore should work fine', async () => {
    const fn = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(requestAny, {
        manual: true,
        blockSameParams: true,
        blockSameParamsIgnore: ['timestamp'],
        onFinally: fn,
      }),
    );

    act(() => {
      result.current.run({
        timestamp: Date.now() + 10,
        name: 'jsonz',
      });
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    act(() => {
      result.current.run({
        timestamp: Date.now() + 1,
        name: 'jsonz',
      });
      jest.runAllTimers();
    });
    expect(fn).toBeCalledTimes(1);

    act(() => {
      result.current.run({
        timestamp: Date.now(),
        name: 'jsonz1',
      });
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(fn).toBeCalledTimes(2);
  });

  it('multiple params should work fine', async () => {
    const fn = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(requestAny, {
        blockSameParams: true,
        blockSameParamsIgnore: ['arg1'],
        onSuccess: fn,
      }),
    );

    act(() => {
      result.current.run(1, {
        arg1: Date.now() + 10,
        name: 'jsonz',
      });
      jest.runAllTimers();
    });
    await waitForNextUpdate();

    act(() => {
      result.current.run(1, {
        arg1: Date.now() + 10,
        name: 'jsonz',
      });
      jest.runAllTimers();
    });
    expect(fn).toBeCalledTimes(1);

    act(() => {
      result.current.run(1, {
        arg1: Date.now() + 10,
        name: 'jsonz2',
      });
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(fn).toBeCalledTimes(2);

    act(() => {
      result.current.run(2, {
        arg1: Date.now() + 10,
        name: 'jsonz2',
      });
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(fn).toBeCalledTimes(3);
  });
});
