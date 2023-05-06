// Scroll to the bottom of the chat
import React, { Ref, RefObject, useEffect, useState } from "react";

export default function useAutoScroll<T extends HTMLElement>(
  ref: RefObject<HTMLElement>
) {
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const elem = ref.current;
    // Listen to DOM changes to keep scrolling to the bottom
    const observer = new MutationObserver(() => {
      if (elem && autoScroll) {
        elem.scrollIntoView({
          block: "end",
          inline: "nearest",
          behavior: "auto",
        });
      }
    });
    if (elem) {
      observer.observe(elem, {
        childList: true,
        subtree: true,
      });
    }
  }, [ref.current]);

  useEffect(() => {
    // Listen to scroll events to disable auto scroll when the user scrolls up
    const elem = ref.current;
    if (elem) {
      const scrollHandler = () => {
        const scrollBottom =
          elem.scrollHeight - elem.scrollTop - elem.clientHeight;
        setAutoScroll(scrollBottom < 10);
      };
      elem.addEventListener("scroll", scrollHandler);
      elem.addEventListener("wheel", scrollHandler);
      return () => {
        elem.removeEventListener("wheel", scrollHandler);
        elem.removeEventListener("scroll", scrollHandler);
      };
    }
  });

  return ref;
}
