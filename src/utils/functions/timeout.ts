/* eslint-disable prefer-rest-params */
/**
 * @module functions/timeout
 */

/**
 * 创建防抖函数
 * @param {function} fn
 * @param {number} wait
 * @param {boolean} immediate 是否立即执行函数
 * @return {function}
 */
export function debounce(fn, wait, immediate) {
  let timeout = null;

  return function () {
    const callNow = immediate && !timeout;
    const next = () => {
      timeout = null;
      if (!immediate) {
        // @ts-ignore
        fn.apply(this, arguments);
      }
    };

    clearTimeout(timeout);
    timeout = setTimeout(next, wait);

    if (callNow) {
      fn.apply(this, arguments);
    }
  };
}

/**
 * 创建节流函数
 * @param {function} fn
 * @param {number} wait
 * @param {boolean} immediate 是否立即执行
 */
export function throttle(fn, wait, immediate) {
  let timeout = null;
  let lastTime = 0;

  return function () {
    const callNow = immediate && !timeout;
    const nowTime = Date.now();
    const next = () => {
      timeout = null;
      // @ts-ignore
      fn.apply(this, arguments);
    };

    if (timeout || (lastTime && nowTime < lastTime + wait)) {
      return;
    }

    lastTime = nowTime;

    if (callNow) {
      fn.apply(this, arguments);
    } else {
      timeout = setTimeout(next, wait);
    }
  };
}

/**
 * 用于在asnyc函数中等待
 * @param {*} time
 * @returns
 */
export function sleep(time) {
  return new Promise((r) => {
    setTimeout(r, time);
  });
}
