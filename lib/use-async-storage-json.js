import { useEffect } from 'react';
import useAsyncStorage from '@rnhooks/async-storage';

function useAsyncStorageJSON(key, defaultValue = undefined) {
  const [storageItem, updateStorageItem, clearStorageItem] = useAsyncStorage(
    key
  );

  useEffect(() => {
    if (storageItem === null && defaultValue !== undefined) {
      updateStorageItem(defaultValue);
    }
  }, [defaultValue]);

  return [
    storageItem === null ? defaultValue : JSON.parse(storageItem),
    value => updateStorageItem(JSON.stringify(value)),
    clearStorageItem
  ];
}

export default useAsyncStorageJSON;
