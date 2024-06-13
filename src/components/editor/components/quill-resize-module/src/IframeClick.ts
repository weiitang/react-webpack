/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
class Iframe {
  public hasTracked = false;
  constructor(public element: HTMLIFrameElement, public cb: Function) {}
}
class IframeClick {
  static resolution = 200;
  static iframes: Array<Iframe> = [];
  static interval: NodeJS.Timeout | null = null;
  static track(element: HTMLIFrameElement, cb: Function) {
    this.iframes.push(new Iframe(element, cb));
    if (!this.interval) {
      this.interval = setInterval(() => {
        IframeClick.checkClick();
      }, this.resolution);
    }
  }
  static checkClick() {
    if (document.activeElement) {
      const { activeElement } = document;
      for (const i in this.iframes) {
        if (activeElement === this.iframes[i].element) {
          if (this.iframes[i].hasTracked === false) {
            this.iframes[i].cb.apply(window, []);
            this.iframes[i].hasTracked = true;
          }
        } else {
          this.iframes[i].hasTracked = false;
        }
      }
    }
  }
}
export default IframeClick;
