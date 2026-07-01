import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModuleState {
  orderManagement: boolean;
  procurementOptimization: boolean;
  toggleModule: (key: 'orderManagement' | 'procurementOptimization') => void;
}

const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      orderManagement: false,  // 订单管理默认关闭
      procurementOptimization: true,
      toggleModule: (key) => set((state) => ({ [key]: !state[key] })),
    }),
    { name: 'flux-scm-modules' }
  )
);

export default useModuleStore;
