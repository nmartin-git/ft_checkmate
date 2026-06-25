import { create } from 'zustand';

interface PlayModalStore{
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
}

const usePlayModal = create<PlayModalStore>((set) => ({
	isOpen: false,
	onOpen: () => set({isOpen: true}),
	onClose: () => set({isOpen: false})
}))

export default usePlayModal