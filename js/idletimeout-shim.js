export const getRequestIdleCallback = () => {
  const fallback = (handler) => {
    const startTime = Date.now();

    return setTimeout(() => {
      handler({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50.0 - (Date.now() - startTime)),
      });
    }, 1);
  };

  return window.requestIdleCallback || fallback;
};

