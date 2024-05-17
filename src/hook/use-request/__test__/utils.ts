export function request(req?: number | string): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (req === 0) {
        reject(new Error('fail'));
      } else {
        resolve(`success${typeof req === 'string' ? req : ''}`);
      }
    }, 1000);
  });
}

export function requestAny(...args: any[]): Promise<any> {
  const req = args?.[0];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`success${typeof req === 'string' ? req : ''}`);
    }, 1000);
  });
}
