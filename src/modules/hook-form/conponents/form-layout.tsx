/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import * as styles from './index.module.less';

export interface TppFormLayoutProps {
  className?: string;
  style?: React.CSSProperties;
  titleTag?: string;
  children: React.ReactNode;
  topStickyTranslate?: 0 | 80;
}

type CatalogLinkType = { id?: string; title: string };

interface TPPFormAnchorContextType {
  catalogs: CatalogLinkType[];
  addLink: (catalog: CatalogLinkType) => void;
  removeLink: (catalog: CatalogLinkType) => void;
}

const TPPFormAnchorContext = React.createContext<TPPFormAnchorContextType>({
  catalogs: [],
  addLink: () => {},
  removeLink: () => {},
});

export function TestFormLayout(props: TppFormLayoutProps) {
  const { children, className, style, topStickyTranslate = 0 } = props;

  const [activeIndex, setActiveIndex] = useState(0);
  const previousActiveIndex = React.useRef(activeIndex);
  const [catalogs, updateCatalog] = React.useState<CatalogLinkType[]>([]);
  const formLeftRef = useRef(null);
  const formRightRef = useRef(null);

  const anchorContextValue = React.useMemo<TPPFormAnchorContextType>(() => {
    const addLink = (catalog: CatalogLinkType) =>
      updateCatalog((catalogs) => [...catalogs, catalog]);

    const removeLink = (catalog: CatalogLinkType) =>
      updateCatalog((catalogs) =>
        catalogs.filter((item) => item.title !== catalog.title)
      );

    return {
      catalogs,
      addLink,
      removeLink,
    };
  }, [catalogs]);

  function getActiveStyle(index) {
    return activeIndex === index
      ? {
          color: '#0052d4',
          borderRight: '1px solid #0052d4',
        }
      : {};
  }

  React.useEffect(() => {
    // 更新左侧样式
    formLeftRef.current.style.height = `${catalogs.length * 42 + 48}px`;

    // 更新监听
    const titleDomList = formRightRef.current.querySelectorAll(
      '[tpp-form-catalog-id]'
    );
    function handleScroll() {
      const tops = Array.from(titleDomList).map(
        (item: Element) => item.getBoundingClientRect().top
      );
      const index = tops.findIndex((item) => item > 0);
      let activeIndex = index - 1;
      if (index === -1) {
        activeIndex = tops.length - 1;
      } else if (activeIndex < 0) {
        activeIndex = 0;
      }

      if (previousActiveIndex.current === activeIndex) return;
      previousActiveIndex.current = activeIndex;
      setActiveIndex(activeIndex);
    }
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [catalogs]);

  return (
    <TPPFormAnchorContext.Provider value={anchorContextValue}>
      <section
        className={classNames(styles.tppFormLayout, className)}
        style={style}
      >
        <div
          className={styles.formLeft}
          ref={formLeftRef}
          style={{
            top: topStickyTranslate,
          }}
        >
          {catalogs.map((item, index) => (
            <a
              href={`#${item.id}`}
              key={index}
              className={styles.formLeftItem}
              style={getActiveStyle(index)}
            >
              {item.title}
            </a>
          ))}
        </div>
        <div className={styles.formRight} ref={formRightRef}>
          {children}
        </div>
      </section>
    </TPPFormAnchorContext.Provider>
  );
}

TestFormLayout.Catalog = Catalog;

export function Catalog(props: {
  id?: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  styles?: React.CSSProperties;
}) {
  const { title, id, children, className, styles: propsStyles = {} } = props;
  const { addLink, removeLink } = React.useContext(TPPFormAnchorContext);

  // id = id > children > title
  // title = title > children
  const catalogId: string =
    id || (typeof children === 'string' ? children : title);
  const catalogTitle: string =
    title || (typeof children === 'string' ? children : null);

  if (!catalogTitle) throw new Error('catalog title is required');

  React.useEffect(() => {
    const catalog = { id: catalogId, title: catalogTitle };
    addLink(catalog);
    return () => removeLink(catalog);
  }, [catalogId, catalogTitle]);

  return (
    <div
      className={classNames(styles.catalogTitle, className)}
      style={propsStyles}
      tpp-form-catalog-id={catalogId}
      id={catalogId}
    >
      {children || title}
    </div>
  );
}
