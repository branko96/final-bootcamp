import create from 'zustand'

export const useContractsStore = create((set) => ({
    nftContract: {},
    nftMarketContract: {},
    setContracts: (nftMarketContract, nftContract) => set(() => ({ nftContract, nftMarketContract })),
}))
