// utils/fetchWithLoader.ts
import { showGlobalLoader, hideGlobalLoader } from '@/contexts/loader-context';

export async function fetchWithLoader<T>(fetchFn: () => Promise<T>): Promise<T> {
  showGlobalLoader();
  try {
    return await fetchFn();
  } finally {
    hideGlobalLoader();
  }
}
