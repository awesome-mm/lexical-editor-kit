type DebounceOptions = {
  leading?: boolean; // 처음 호출 시 바로 실행
  trailing?: boolean; // 마지막 호출 후 실행 (기본 true)
  maxWait?: number; // 최대 지연 시간
};

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait = 0,
  options: DebounceOptions = {},
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const { leading = false, trailing = true, maxWait } = options;

  const invoke = () => {
    if (lastArgs) {
      func(...lastArgs);
      lastArgs = null;
      lastCallTime = Date.now();
    }
  };

  const debounced = (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    if (!lastCallTime) lastCallTime = now;

    const remaining = wait - (now - lastCallTime);
    const isMaxExceeded = maxWait && now - lastCallTime >= maxWait;

    if (leading && !timeout) {
      invoke();
    }

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(
      () => {
        if (trailing) invoke();
        timeout = null;
        lastCallTime = null;
      },
      remaining > 0 ? remaining : 0,
    );

    if (isMaxExceeded) {
      invoke();
      if (timeout) clearTimeout(timeout);
      timeout = null;
      lastCallTime = null;
    }
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    lastArgs = null;
    lastCallTime = null;
  };

  return debounced;
}
