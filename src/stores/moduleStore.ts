import { create } from 'zustand';

interface ModuleState {
  orderManagement: boolean;
  procurementOptimization: boolean;
  toggleModule: (key: 'orderManagement' | 'procurementOptimization') => void;
}

const useModuleStore = create<ModuleState>((set) => ({
  orderManagement: false,  // 订单管理默认关闭
  procurementOptimization: true,
  toggleModule: (key) => set((state) => ({ [key]: !state[key] })),
}));

export default useModuleStore;
