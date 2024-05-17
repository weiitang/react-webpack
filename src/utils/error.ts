export function createError(message: string, cause?: 'warn' | 'error') {
  const error = new Error(message);
  if (cause) {
    error.cause = new Error(`[${cause}] ${message}`);
  }
  return error;
}

export function createErrorToastBootstrap(showError) {
  // 确保单条警告只出现一次，而不是出现多次
  const warningQueue = [];
  setInterval(() => {
    if (!warningQueue.length) {
      return;
    }
    const items = [];
    warningQueue.forEach(({ method, message }) => {
      if (
        items.some((item) => item.method === method && item.message === message)
      ) {
        return;
      }
      items.push({ method, message });
    });
    items.forEach(({ method, message }) => {
      showError(method, message);
    });
    warningQueue.length = 0;
  }, 32);

  const createWarnBy =
    (mapping: { [type: string]: string }) => (error, callback?, fallback?) => {
      if (error?.cause instanceof Error) {
        const cause = (error.cause as Error).message || '';
        const prefixes = Object.keys(mapping);
        let flag = false;
        for (let i = 0, len = prefixes.length; i < len; i++) {
          const prefix = prefixes[i];
          const method = mapping[prefix];
          const prefixStr = `[${prefix}]`;
          if (cause.indexOf?.(prefixStr) === 0) {
            warningQueue.push({
              method,
              message: cause.substring(prefixStr.length).trim(),
            });
            callback();
            flag = true;
            break;
          }
        }
        if (!flag) {
          fallback?.();
        }
      } else {
        fallback?.();
      }
    };

  return createWarnBy;
}
