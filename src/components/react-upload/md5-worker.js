import { calculateHashSync } from './utils';
// 子线程

self.onmessage = (async (event) => {
  const hash = await calculateHashSync([event.data]);
  self.postMessage(hash);
});
