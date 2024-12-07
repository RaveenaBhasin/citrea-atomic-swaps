import { atom } from 'jotai';

export const walletTypeAtom = atom<string | null>(null);
export const walletAddressAtom = atom<string | null>(null);
export const isWalletModalOpenAtom = atom(false);