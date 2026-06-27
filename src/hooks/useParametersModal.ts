import { create } from 'zustand'

interface ParametersModalStore {
	isOpen: boolean;
	recoveryCodes: string[] | null;
	onOpen: (codes: string []) => void;
	onClose: () => void;
}

const useParametersModal = create<ParametersModalStore>((set)=>({
	isOpen: false,
	onOpen: (codes) => set({isOpen: true, recoveryCodes: codes }),
	onClose: () => set({isOpen: false, recoveryCodes: null }),
	recoveryCodes: null
}))

export default useParametersModal