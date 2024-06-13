/**
 * 富文本预览
 */

import classNames from 'classnames';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { ImageViewer } from 'tdesign-react';
import ResizeObserver from 'resize-observer-polyfill';
import * as styles from './editor.less';

const ua = navigator.userAgent;
const isChrome = ua.indexOf('Chrome') !== -1;
const isSafari = !isChrome && ua.indexOf('Safari') !== -1;

export function Previewer(props: { content: string; imageViewer: boolean }) {
  const { content, imageViewer } = props;
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const wrapperRef = useRef(null);
  const lastHeightRef = useRef(0);

  useEffect(() => {
    if (wrapperRef.current && content) {
      setTimeout(fetchImages, 0);
    }
  }, [wrapperRef, content]);

  useEffect(() => {
    if (!isSafari) {
      return;
    }

    // Safari下，图片加载后撑开，会造成一些残影，需要触发下渲染（如Portfolio Review列表打开一个公司，切换到另一个有公司填报数据的公司，会造成表格残影）
    let timer = null;
    const ro = new ResizeObserver(() => {
      if (!wrapperRef.current) {
        return;
      }

      const { offsetHeight } = wrapperRef.current;
      if (offsetHeight !== lastHeightRef.current) {
        lastHeightRef.current = offsetHeight;
        timer = setTimeout(() => {
          if (wrapperRef.current) {
            wrapperRef.current.style.transform = 'scale(1)';
          }
        }, 0);
      }
    });

    ro.observe(wrapperRef.current);

    return () => {
      timer && clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  const fetchImages = () => {
    const imgs = wrapperRef.current?.querySelectorAll(
      `.${styles.previewer} img`
    );
    const imgsSrc = [];
    if (imgs) {
      for (let i = 0, len = imgs.length; i < len; i++) {
        imgsSrc.push(imgs[i].src);
      }
    }
    setImages(imgsSrc);
  };

  const handleImgPreview = (e: SyntheticEvent, openHandler: any) => {
    if (!imageViewer) {
      return;
    }

    const { target } = e;
    if ((target as Node)?.nodeName === 'IMG') {
      const { src } = target as any;
      const index = images.indexOf(src);
      if (index !== -1) {
        setIndex(index);
      }
      openHandler?.();
    }
  };

  // Right side of assignment cannot be destructured
  // 传进来的可能为空
  // const trigger = ({ open }) => (
  const trigger = (event: any) => (
    <div
      ref={wrapperRef}
      className={classNames('ql-editor', styles.previewer, {
        [styles.pointer]: imageViewer,
      })}
      dangerouslySetInnerHTML={{ __html: content }}
      onClick={(e) => handleImgPreview(e, event?.open)}
    ></div>
  );

  const onIndexChange = (i: number) => {
    setIndex(i);
  };

  if (imageViewer) {
    return (
      <ImageViewer
        trigger={trigger}
        index={index}
        images={images}
        onIndexChange={onIndexChange}
      />
    );
  }

  return trigger({ open: null });
}
