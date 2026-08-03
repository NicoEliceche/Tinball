import { useEffect } from 'react';
import { useTinballStore } from '../../store/useTinballStore';
import { loadProductData } from './productService';

export function useProductBootstrap(enabled: boolean) {
  const dataStatus = useTinballStore((state) => state.dataStatus);

  useEffect(() => {
    if (!enabled || dataStatus !== 'IDLE') return;
    let active = true;
    useTinballStore.getState().setDataLoading();
    loadProductData()
      .then((data) => { if (active) useTinballStore.getState().replaceServerData(data); })
      .catch((error: unknown) => {
        if (!active) return;
        useTinballStore.getState().setDataError(error instanceof Error ? error.message : 'No pudimos cargar tus datos.');
      });
    return () => { active = false; };
  }, [dataStatus, enabled]);
}
