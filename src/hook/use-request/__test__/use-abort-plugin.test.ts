import { act, renderHook } from '@testing-library/react-hooks';
import { useRequest } from '../use-request';
import { request, requestAny } from './utils';

describe('useAbortPlugin', () => {
  jest.useFakeTimers();

  it('abort should work fine', async () => {
    const abortCallback = jest.fn();
    const successCallback = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(request, {
        abortBeforeRequire: true,
        manual: true,
        onAbort: abortCallback,
        onSuccess: successCallback,
      }),
    );

    act(() => {
      result.current.run();
      result.current.run();
      result.current.run();
      result.current.run();
      result.current.run();
      jest.runAllTimers();
    });

    await waitForNextUpdate();
    expect(abortCallback).toBeCalledTimes(4);
    expect(successCallback).toBeCalledTimes(1);

    act(() => {
      result.current.run();
      result.current.cancel();
    });
    expect(abortCallback).toBeCalledTimes(5);

    act(() => {
      result.current.run();
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(successCallback).toBeCalledTimes(2);
  });

  it('customAbortParams should work fine', async () => {
    let abort: any = null;
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(() => requestAny({ name: 'jsonz' }), {
        // @ts-ignore
        defaultParams: [{ name: 'jsonz' }],
        customAbortParams(tParams, abortController) {
          // @ts-ignore
          (tParams[0] as any).abort = 'abort';
          if (!abort) abort = abortController;
          return tParams;
        },
        manual: true,
        abortBeforeRequire: true,
      }),
    );

    act(() => {
      result.current.run();
    });
    expect(abort.signal).toEqual(
      expect.objectContaining({
        aborted: false,
        reason: undefined,
      }),
    );
    // @ts-ignore
    expect((result.current.params[0] as any).abort).toEqual('abort');
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    act(() => {
      result.current.run();
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(abort.signal).toEqual(
      expect.objectContaining({
        aborted: true,
        reason: 'Has a new request',
      }),
    );
    expect(abortSpy).toBeCalledTimes(1);
  });

  it('abort default params format should work fine', async () => {
    let abort: any = null;

    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(() => requestAny({ name: 'jsonz' }), {
        abortBeforeRequire: true,
        manual: true,
        onSuccess(data, params: any) {
          abort = params[0].abort;
        },
      }),
    );

    act(() => {
      result.current.run({ name: 'test' });
      jest.runAllTimers();
    });
    await waitForNextUpdate();

    expect(abort.signal).toEqual(
      expect.objectContaining({
        aborted: false,
        reason: undefined,
      }),
    );
  });

  it('abortCallback', async () => {
    const cb = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useRequest(request, {
        onAbort: cb,
      }),
    );
    act(() => {
      result.current.run();
      jest.runAllTimers();
    });
    await waitForNextUpdate();
    expect(cb).toBeCalledTimes(0);
  });
});
