import {onBeforeUnmount, onMounted, watch, type Ref} from 'vue';

type InfiniteScrollOptions = {
  target: Ref<HTMLElement | null>;
  canLoadMore: Ref<boolean>;
  isLoading: Ref<boolean>;
  onLoadMore: () => Promise<void>;
  rootMargin?: string;
  threshold?: number;
};

export const useInfiniteScroll = ({
  target,
  canLoadMore,
  isLoading,
  onLoadMore,
  rootMargin = '200px 0px',
  threshold = 0,
}: InfiniteScrollOptions) => {
  let observer: IntersectionObserver | null = null;
  let isAwaitingResponse = false;

  const observeTarget = () => {
    if (!observer || !target.value) return;
    observer.observe(target.value);
  };

  const unobserveTarget = () => {
    if (!observer || !target.value) return;
    observer.unobserve(target.value);
  };

  const handleIntersect: IntersectionObserverCallback = async (entries) => {
    const [entry] = entries;

    if (!entry?.isIntersecting || !canLoadMore.value || isLoading.value || isAwaitingResponse) {
      return;
    }

    isAwaitingResponse = true;
    unobserveTarget();

    try {
      await onLoadMore();
    } finally {
      isAwaitingResponse = false;
      observeTarget();
    }
  };

  onMounted(() => {
    observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin,
      threshold,
    });

    observeTarget();
  });

  watch(target, (_, previousTarget) => {
    if (observer && previousTarget) {
      observer.unobserve(previousTarget);
    }

    observeTarget();
  });

  watch(canLoadMore, (enabled) => {
    if (!observer) return;

    if (enabled) {
      observeTarget();
      return;
    }

    unobserveTarget();
  });

  onBeforeUnmount(() => {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  });
};
