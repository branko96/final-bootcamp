import Link from "next/link";
import { useAccount, useConnect, useContract, useDisconnect, useSigner } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useContractsStore } from "../store";
import { useCallback, useEffect } from "react";
import { nftAddress, nftMarketAddress } from "../config";
import NFT from "../artifacts/NFT.json";
import NFTMarket from "../artifacts/NFTMarket.json";
import { useSessionStore } from "../store/sessionStore";
import shallow from "zustand/shallow";

function NavBar() {
    const { address } = useAccount()
    const { connect } = useConnect({
        chainId: 3,
        connector: new InjectedConnector({ chains: [3], options: {} }),
    })
    const { disconnect } = useDisconnect()
    const { data: provider } = useSigner()
    const setContracts = useContractsStore((state) => state.setContracts)
    const nftContract = useContract({
        addressOrName: nftAddress,
        contractInterface: NFT.abi,
        signerOrProvider: provider
    })
    const nftMarketContract = useContract({
        addressOrName: nftMarketAddress,
        contractInterface: NFTMarket.abi,
        signerOrProvider: provider
    })
    const [setAccount, deleteAccount, account] = useSessionStore((state) => [state.setAccount, state.deleteAccount, state.account], shallow)

    useEffect(() => {
        if (nftContract.signer && nftMarketContract.signer) {
            setContracts(nftMarketContract, nftContract)
        }
    }, [setContracts, nftMarketContract, nftContract, provider])

    const handleConnect = useCallback(async () => {
        try {
            window.ethereum?.request({ method: "eth_requestAccounts" }).then((accounts) => {
                connect()
                setContracts(nftMarketContract, nftContract)
                setAccount(accounts[0])
            });
        } catch (e) {
        }
    }, [connect, setContracts, nftMarketContract, nftContract])

    const handleDisconnect = useCallback(() => {
        deleteAccount()
        disconnect()
    }, [disconnect, deleteAccount])

    const isConnected = !!account

    return (    <nav className="border-b p-6">
        <p className="text-4xl font-bold">Marketplace NFT</p>
        <div className="flex mt-4 items-center">
            <Link href="/">
                <a className="mr-6 text-indigo-500">Home</a>
            </Link>
            {address && (
                <>
                    <Link href="/create-item">
                        <a className="mr-6 text-indigo-500">Sell Digital Asset</a>
                    </Link>
                    <Link href="/my-assets">
                        <a className="mr-6 text-indigo-500">My Digital Assets</a>
                    </Link>
                    <Link href="/creator-dashboard">
                        <a className="mr-6 text-indigo-500">Creator Dashboard</a>
                    </Link>
                </>
            )}
            <div className="flex flex-1 justify-end">
                {isConnected ? (
                    <div>
                        <div>
                            <h6 className="font-bold text-lg">
                                <span className="text-green-500 flex-row flex justify-center items-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.12104 17.8037C7.15267 16.6554 9.4998 16 12 16C14.5002 16 16.8473 16.6554 18.879 17.8037M15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span className="ml-2">{address}</span>
                                </span>
                            </h6>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="text-red-500 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 16L7 12M7 12L11 8M7 12L21 12M16 16V17C16 18.6569 14.6569 20 13 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H13C14.6569 4 16 5.34315 16 7V8" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>

                            <span>Disconnect</span>
                        </button>
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={handleConnect}
                            className="text-red-500 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 9V12M18 12V15M18 12H21M18 12H15M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM3 20C3 16.6863 5.68629 14 9 14C12.3137 14 15 16.6863 15 20V21H3V20Z" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Connect</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </nav>)
}

export default NavBar;
