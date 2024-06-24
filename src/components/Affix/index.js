import React, { useCallback, useEffect, useRef, useState } from 'react';
import cls from 'classnames';

function outerHeight(el) {
  let height = el.offsetHeight;
  const style = getComputedStyle(el);

  height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
  return height;
}

/**
 * Affix
 * 
 * From https://gist.github.com/julianocomg/296469e414db1202fc86?permalink_comment_id=3050760#gistcomment-3050760
 * @param {{
  top: number;
  children: React.ReactNode;
  offset?: number;
  className?: string;
}} props
 * @returns JSX.Element
 */
const Affix = ({ top, children, /** Offset could make the element fixed ealier or later */ offset = 0, className, activeClassName } = {}) => {
  const element = useRef();

  const [phHeight, setPhHeight] = useState(0);
  const [oldStyles, setOldStyle] = useState({
    position: '',
    top: '',
    width: '',
  });
  const [isAffix, setAffix] = useState(false);

  useEffect(() => {
    setPhHeight(`${outerHeight(element.current)}px`);
  }, []);

  const checkPosition = useCallback(
    ({ distanceToBody, clientWidth }) => {
      const scrollTop = window.scrollY;

      if (distanceToBody - scrollTop < top + offset) {
        if (element.current.style.position !== 'fixed') {
          setOldStyle((prev) => {
            Object.keys(prev).forEach((key) => {
              prev[key] = element.current.style[key];
            });

            return { ...prev };
          });

          element.current.style.position = 'fixed';
          element.current.style.width = `${clientWidth}px`;
          element.current.style.top = `${top}px`;

          setAffix(true);
        }
      } else {
        // reset to default
        setOldStyle((prev) => {
          if (prev) {
            Object.keys(prev).forEach((key) => {
              element.current.style[key] = prev[key];
            });
          }
          return prev;
        });

        setAffix(false);
      }
    },
    [offset, top]
  );

  useEffect(() => {
    if (typeof window.scrollY === 'undefined') {
      // don't work in IE
      return undefined;
    }

    if (!element.current) {
      return undefined;
    }

    const distanceToBody = window.scrollY + element.current.getBoundingClientRect().top;
    const handleScroll = () => {
      requestAnimationFrame(() => {
        checkPosition({ distanceToBody, clientWidth: element.current.clientWidth });
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [checkPosition]);

  return (
    <>
      <div
        ref={element}
        style={{ zIndex: 1, display: 'flex' }}
        className={cls(className, {
          'affix-active': isAffix,
          [activeClassName || '']: isAffix,
        })}
      >
        {children}
      </div>
      {isAffix && <div style={{ height: phHeight }} />}
    </>
  );
};

export default Affix;
