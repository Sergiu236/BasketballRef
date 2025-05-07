// src/hooks/useInfiniteScroll.ts
import { useRef, useCallback } from 'react';

interface InfiniteScrollOptions {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export default function useInfiniteScroll({ loadMore, hasMore, isLoading }: InfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore]
  );

  return lastElementRef;
}
