import create from 'zustand'

export const useSessionStore = create((set) => ({
    account: "",
    setAccount: (account) => set(() => ({ account })),
    deleteAccount: () => set(() => ({ account: "" })),
}))
