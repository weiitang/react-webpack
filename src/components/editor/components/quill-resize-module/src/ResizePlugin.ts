/* eslint-disable no-param-reassign */
import './ResizePlugin.less';

interface Size {
  width: number;
  height: number;
}

class ResizeElement extends HTMLElement {
  public originSize?: Size | null = null;
}

interface ResizePluginOption {
  [index: string]: any;
}

const restoreIcon = `<svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M6.35355 10.3535L6.35355 13.1464L7.35355 13.1464L7.35356 9.14643C7.35356 8.87029 7.1297 8.64643 6.85356 8.64643L2.85356 8.64643L2.85355 9.64643L5.64645 9.64643L2.5 12.7929L3.20711 13.5L6.35355 10.3535Z" fill="currentColor" /><path d="M9.99996 5.14646L9.99996 2.35357L8.99996 2.35357L8.99996 6.35357C8.99996 6.62971 9.22382 6.85357 9.49996 6.85357L13.5 6.85357L13.5 5.85357L10.7071 5.85357L13.8535 2.7071L13.1464 2L9.99996 5.14646Z" fill="currentColor" /><path d="M5.57322 5.9268L2.78033 5.9268L2.78033 6.9268L6.78033 6.9268C7.05647 6.9268 7.28033 6.70294 7.28033 6.4268L7.28033 2.4268L6.28033 2.4268L6.28033 5.21969L3.13386 2.07324L2.42676 2.78035L5.57322 5.9268Z" fill="currentColor" /><path d="M10.7803 9.5732L13.5732 9.5732L13.5732 8.5732L9.57319 8.5732C9.29704 8.5732 9.07319 8.79706 9.07319 9.0732L9.07319 13.0732L10.0732 13.0732L10.0732 10.2803L13.2197 13.4268L13.9268 12.7196L10.7803 9.5732Z" fill="currentColor" /></svg>`;

const deleteIcon = `<svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M6 12V6H7V12H6Z" fill="currentColor" /><path d="M9 6V12H10V6H9Z" fill="currentColor" /><path d="M10.5 3H14V4H13V14C13 14.5523 12.5523 15 12 15H4C3.44772 15 3 14.5523 3 14V4H2V3H5.5L5.5 1.8C5.5 1.35817 5.85817 1 6.3 1H9.7C10.1418 1 10.5 1.35817 10.5 1.8V3ZM6.5 3H9.5L9.5 2L6.5 2V3ZM4 4V14H12V4H4Z" fill="currentColor" /></svg>`;

const template = `
<div class="toolbar">
  <div class="group">
    <div class="btn btn-icon js-btn" data-action="restore" title="原始大小">${restoreIcon}</div>
    <div class="btn-group">
      <div class="slider-btn js-btn js-btn-reduce" data-action="-" title="缩小">﹣</div>
      <div class="slider js-slider"><div class="slider-bar"><div class="slider-bar-inner js-slider-progress" style="width:0%"></div></div><div class="slider-dot js-btn-slider-dot"></div></div>
      <div class="slider-btn js-btn js-btn-add" data-action="+" title="放大">﹢</div>
    </div>
    <div class="btn btn-icon js-btn" data-action="delete" title="删除图片">${deleteIcon}</div>
  </div>
</div>
`;

const MIN_UNIT = 5; // 最小缩放比例
const STEP_UNIT = 5; // 每次+-的比例

class ResizePlugin {
  resizeTarget: ResizeElement;
  resizer: HTMLElement | null = null;
  container: HTMLElement;
  contentContainer: HTMLElement;
  btnReduce: HTMLElement;
  btnAdd: HTMLElement;
  elSlider: HTMLElement;
  btnSliderProgress: HTMLElement;
  btnSliderDot: HTMLElement;
  startSliderPosition: any = null;
  options: any;
  lastSlideTime: number = +new Date();
  lastSlideTimer: any = null;

  constructor(
    resizeTarget: ResizeElement,
    container: HTMLElement,
    options?: ResizePluginOption
  ) {
    this.options = options;
    this.resizeTarget = resizeTarget;
    if (!resizeTarget.originSize) {
      resizeTarget.originSize = {
        width: resizeTarget.clientWidth,
        height: resizeTarget.clientHeight,
      };
    }

    this.container = container;
    this.contentContainer = container.querySelector('.ql-editor');
    this.initResizer();
    this.btnReduce = this.resizer.querySelector('.js-btn-reduce');
    this.btnAdd = this.resizer.querySelector('.js-btn-add');
    this.elSlider = this.resizer.querySelector('.js-slider');
    this.btnSliderProgress = this.resizer.querySelector('.js-slider-progress');
    this.btnSliderDot = this.resizer.querySelector('.js-btn-slider-dot');
    this.positionResizerToTarget(resizeTarget);
    this.positionSlider();

    this.onMouseUp = this.onMouseUp.bind(this);
    this.startSyncSlider = this.startSyncSlider.bind(this);
    this.syncSlider = this.syncSlider.bind(this);
    this.toolbarClick = this.toolbarClick.bind(this);
    this.bindEvents();
  }

  initResizer() {
    let resizer: HTMLElement | null =
      this.container.querySelector('.editor-resizer');
    if (!resizer) {
      resizer = document.createElement('div');
      resizer.setAttribute('class', 'editor-resizer');
      resizer.innerHTML = template;
      this.container.appendChild(resizer);
    }
    this.resizer = resizer;
  }

  positionResizerToTarget(el: HTMLElement) {
    if (this.resizer !== null) {
      // fix: 修复定位时没有计算容器滚动高度的问题
      const {
        offsetWidth: contentContainerWidth,
        offsetHeight: contentContainerHeight,
        scrollTop,
        scrollLeft,
      } = this.getContentContainerSize();
      const iLeft = el.offsetLeft - scrollLeft;
      const iTop = el.offsetTop - scrollTop;
      const left = Math.max(iLeft, 0);
      const top = Math.max(iTop, 0);

      // 限定resizer尺寸为当前图片可视区域大小
      let width = el.clientWidth;
      if (iLeft + width > contentContainerWidth) {
        width = contentContainerWidth - left;
      } else {
        width += Math.min(iLeft, 0);
      }

      let height = el.clientHeight;
      if (iTop + height > contentContainerHeight) {
        height = contentContainerHeight - top;
      } else {
        height += Math.min(iTop, 0);
      }

      this.resizer.style.setProperty('left', `${left}px`);
      this.resizer.style.setProperty('top', `${top}px`);
      this.resizer.style.setProperty('width', `${width}px`);
      this.resizer.style.setProperty('height', `${height}px`);

      // 超出可视区域
      if (width < 0 || height < 0) {
        this.destory();
      }
    }
  }

  bindEvents() {
    if (this.resizer !== null) {
      this.resizer.addEventListener('click', this.toolbarClick);
    }

    // fix: 修复resize时，滚动内容，resize容器没有跟着定位的问题
    if (this.contentContainer !== null) {
      this.contentContainer.addEventListener('scroll', () => {
        this.positionResizerToTarget(this.resizeTarget);
      });
    }

    this.btnSliderDot.addEventListener('mousedown', this.startSyncSlider);

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.syncSlider);
  }

  isBtn(target: HTMLElement) {
    const isBtn = target.classList.contains('js-btn');

    // 子元素继续往上找，如svg、svg.path
    if (!isBtn && target.parentElement) {
      return this.isBtn(target.parentElement);
    }

    return [isBtn, target];
  }

  /**
   * 获取图片当前宽度与容器的比例
   * @param unit 需要加减的比例
   * @returns
   */
  getImagePercent(unit = 0) {
    if (this.resizeTarget) {
      const { style } = this.resizeTarget;
      const styleWidth = style.getPropertyValue('width');
      let percent = 0;
      if (styleWidth.includes('%')) {
        percent = Math.min(
          Math.max(parseInt(styleWidth, 10) + unit, MIN_UNIT),
          100
        );
      } else {
        const { width: contentContainerWidth } = this.getContentContainerSize();
        const ratio = Math.min(
          (this.resizeTarget.clientWidth / contentContainerWidth) * 100,
          100
        ); // px转百分比
        percent = Math.min(Math.max(ratio + unit, MIN_UNIT), 100);
      }

      return Math.ceil(percent);
    }

    return 0;
  }

  getContentContainerSize() {
    const styles = window.getComputedStyle(this.contentContainer);
    const boxSizing = styles.getPropertyValue('box-sizing');
    const paddingLeft = styles.getPropertyValue('padding-left');
    const paddingRight = styles.getPropertyValue('padding-right');
    const paddingTop = styles.getPropertyValue('padding-top');
    const paddingBottom = styles.getPropertyValue('padding-bottom');
    const borderLeftWidth = styles.getPropertyValue('border-left-width');
    const borderRightWidth = styles.getPropertyValue('border-right-width');
    const borderTopWidth = styles.getPropertyValue('border-top-width');
    const borderBottomWidth = styles.getPropertyValue('border-bottom-width');
    const { offsetWidth, offsetHeight, scrollTop, scrollLeft } =
      this.contentContainer;
    // border-box时，最终算出来的width不含滚动条宽度, styles.getPropertyValue('width')的值包含border、padding
    // content-box时，最终算出来的width包含滚动条宽度，styles.getPropertyValue('width')的值不包含滚动条的宽度
    const size =
      boxSizing === 'border-box'
        ? {
            width:
              offsetWidth -
              parseInt(paddingLeft, 10) -
              parseInt(paddingRight, 10) -
              parseInt(borderLeftWidth, 10) -
              parseInt(borderRightWidth, 10),
            height:
              offsetHeight -
              parseInt(paddingTop, 10) -
              parseInt(paddingBottom, 10) -
              parseInt(borderTopWidth, 10) -
              parseInt(borderBottomWidth, 10),
            offsetWidth,
            offsetHeight,
            scrollTop,
            scrollLeft,
          }
        : {
            // width: offsetWidth - parseInt(paddingLeft, 10) - parseInt(paddingRight, 10),
            // height: offsetHeight - parseInt(paddingTop, 10) - parseInt(paddingBottom, 10),
            width: parseInt(styles.getPropertyValue('width'), 10),
            height: parseInt(styles.getPropertyValue('height'), 10),
            offsetWidth,
            offsetHeight,
            scrollTop,
            scrollLeft,
          };

    return size;
  }

  getImageWidth(percent: number) {
    const { width } = this.getContentContainerSize();
    return Math.ceil((width * percent) / 100);
  }

  positionSlider(percent?: number) {
    const newPercent = percent !== undefined ? percent : this.getImagePercent();
    if (this.btnSliderDot && newPercent >= 0) {
      const { style: sliderProgressStyle } = this.btnSliderProgress;
      const { style: sliderDotStyle } = this.btnSliderDot;
      sliderProgressStyle.width = `${newPercent}%`;
      sliderDotStyle.left = `${newPercent}%`;
    }
  }

  toolbarClick(e: MouseEvent) {
    e.stopPropagation();
    const tmpTarget: HTMLElement = e.target as HTMLElement;
    const [isBtn, target] = this.isBtn(tmpTarget);

    if (isBtn) {
      const { action } = target.dataset;
      const { style } = this.resizeTarget;

      if (action === 'restore') {
        style.removeProperty('width');
        style.removeProperty('height');
        this.positionSlider();
      } else if (action === 'delete') {
        this.resizeTarget?.parentElement?.removeChild(this.resizeTarget);
        this.options?.onChange(this.resizeTarget);
        this.destory();
        return;
      } else if (action === '-' || action === '+') {
        if (this.resizeTarget.tagName.toLowerCase() !== 'iframe') {
          style.removeProperty('height');
        }

        const unit = action === '-' ? -STEP_UNIT : STEP_UNIT; // 每次5%
        const percent = this.getImagePercent(unit);
        if (percent >= 0) {
          style.setProperty('width', `${this.getImageWidth(percent)}px`);
          style.removeProperty('height');
          this.positionSlider(percent);
        }
      }

      this.positionResizerToTarget(this.resizeTarget);
      this.options?.onChange(this.resizeTarget);
    }
  }

  startSyncSlider(e: MouseEvent) {
    // 鼠标左键
    if (e.button === 0 || e.which === 1) {
      this.startSliderPosition = {
        x: e.clientX,
        y: e.clientY,
        sliderWidth: this.elSlider.clientWidth,
        percent: this.getImagePercent(),
      };
    }
  }

  syncSlider(e: MouseEvent) {
    if (this.startSliderPosition) {
      const now = +new Date();
      const threshold = 50; // ms，有效的间隔事件，避免过多执行

      if (this.lastSlideTimer) {
        clearTimeout(this.lastSlideTimer);
      }

      if (now - this.lastSlideTime < threshold) {
        // 避免最后一次没触发
        this.lastSlideTimer = setTimeout(() => {
          this.syncSlider(e);
        }, threshold);
        return;
      }

      const { x, sliderWidth, percent } = this.startSliderPosition;
      let newPercent = ((e.clientX - x) / sliderWidth) * 100;
      newPercent = Math.max(Math.min(percent + newPercent, 100), MIN_UNIT);
      const { style } = this.resizeTarget;
      style.setProperty('width', `${this.getImageWidth(newPercent)}px`);
      this.positionSlider(newPercent);
      this.positionResizerToTarget(this.resizeTarget);

      this.lastSlideTime = +new Date();
    }
  }

  onMouseUp() {
    this.startSliderPosition = null;
    this.options?.onChange(this.resizeTarget);
  }

  destory() {
    // 可能主动销毁了，再次调用时resizer为null
    if (this.resizer) {
      this.container?.removeChild(this.resizer as HTMLElement);
    }

    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.syncSlider);
    this.resizer = null;
  }
}

export default ResizePlugin;
