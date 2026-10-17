import { useCallback, useEffect, useState } from 'react';

export const useAsync = (asyncFn, deps = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi');
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) run().catch(() => {});
  }, [run]);

  return { data, loading, error, run, setData };
};
