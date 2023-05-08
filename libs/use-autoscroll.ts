// Scroll to the bottom of the chat
import { RefObject, useEffect, useRef } from "react";

export default function useAutoScroll<T extends HTMLElement>(
  ref: RefObject<HTMLElement>
) {
  // const [autoScroll, setAutoScroll] = useState(true);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    observerRef.current = new MutationObserver(() =>
      ref.current?.scrollTo({
        top: ref.current.scrollHeight + 1000,
        behavior: "auto",
      })
    );
    observerRef.current.observe(ref.current, {
      childList: true,
      subtree: true,
    });
    return () => observerRef.current!.disconnect();
  }, [ref]);

  useEffect(() => {
    // Listen to scroll events to disable auto scroll when the user scrolls up
    const elem = ref.current;
    const scrollHandler = () => {
      if (!elem) return;
      if (elem.scrollTop >= elem.scrollHeight - elem.clientHeight - 100) {
        observerRef.current?.observe(elem, {
          childList: true,
          subtree: true,
        });
      } else {
        observerRef.current?.disconnect();
      }
    };

    elem?.addEventListener("scroll", scrollHandler);
    elem?.addEventListener("wheel", scrollHandler);
    return () => {
      elem?.removeEventListener("wheel", scrollHandler);
      elem?.removeEventListener("scroll", scrollHandler);
    };
  }, [ref]);

  return ref;
}
