/**
 * 简单的缓存
 */
import { getLocal, setLocal, STORAGE_KEY } from '@src/lib/localStorage';
const cache: { [key: string]: any } = {};

function set(key: string, data: any) {
  cache[key] = data;
}

function get(key: string) {
  return cache[key];
}

function setReleaseCache(data: any) {
  const cacheId = Math.floor(Math.random() * 100000);
  const json = {
    cacheId,
    ...data,
  };
  setLocal(STORAGE_KEY.WORKFLOW_RELEASE_TMP_XML, json);
  return cacheId;
}

function getReleaseCache() {
  const data = getLocal(STORAGE_KEY.WORKFLOW_RELEASE_TMP_XML);
  return data;
}

export default {
  set,
  get,
  setReleaseCache,
  getReleaseCache,
};
