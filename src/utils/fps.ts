export const FPS_DURATION = 5 * 1000;

export enum EnumFrameRate {
  FPS_60 = 'FPS_60',
  FPS_120 = 'FPS_120',
}

let frameRate: EnumFrameRate = null;

export function fpsEstimate() {
  let i = 0;
  const fpsList = [];
  function inside() {
    i += 1;
    if (i > 3) {
      const is120Hz = fpsList.some((fps) => fps > 65);
      if (is120Hz) {
        frameRate = EnumFrameRate.FPS_120;
      } else {
        frameRate = EnumFrameRate.FPS_60;
      }
      return;
    }
    getFps(1000).then((fps) => {
      fpsList.push(fps);
      inside();
    });
  }
  inside();
}

export function getFps(duration: number) {
  return new Promise<number>((resolve, reject) => {
    if (!performance || !requestAnimationFrame) reject();
    let frameCount = 0;
    let startTime = performance.now();
    const animate = () => {
      const animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      if (frameCount < Infinity) {
        frameCount += 1;
      } else {
        reject();
        cancelAnimationFrame(animationFrameId);
      }
      if (now - startTime >= duration) {
        startTime = now;
        const averageFps = frameCount / (duration / 1000);
        resolve(averageFps);
        cancelAnimationFrame(animationFrameId);
      }
    };
    animate();
  });
}

export function getFpsReport(
  cb: (params: { fps: number; frameRate: EnumFrameRate }) => void
) {
  if (!frameRate) return;
  getFps(FPS_DURATION).then((fps) => {
    cb({
      fps,
      frameRate,
    });
  });
}

export function getFrameRate() {
  return frameRate;
}
