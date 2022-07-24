import { useCallback, useEffect, useState } from "react"
import { useAccount } from "wagmi";
import shallow from "zustand/shallow";
import { showError, showSuccess } from "../utils/toastHelper";
import BidsList from "../components/BidsList";
import { useContractsStore } from "../store";
import nftHelper from "../utils/nftHelper"
import { nftAddress } from "../config";

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([])
    const [sold, setSold] = useState([])
    const [bids, setBids] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [itemSelected, setSelectedItem] = useState({})
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [nftMarketContract, nftContract] = useContractsStore((state) => [state.nftMarketContract, state.nftContract], shallow)
    const { address } = useAccount()

    useEffect(() => {
        if(nftMarketContract.signer) {
            loadNFTs()
        }
    }, [nftMarketContract])

    async function loadNFTs() {
        nftHelper.createdItems(nftMarketContract, nftContract).then(nfts => {
            setNfts(nfts)
            const soldItems = nfts.filter(i => i.sold)

            setSold(soldItems)
            setLoadingState('loaded')
        })
    }
    const handleItemSelected = useCallback(async (item) => {
        setSelectedItem(item)
        const bidsOfItem =  await nftMarketContract.fetchBidsOfItem(item.itemId).catch((err) => {
            showError("Failed to get data of item")
        })
        setBids(bidsOfItem)
        setShowModal(true)
    }, [nftMarketContract])

    const handleAcceptBid = useCallback(async (bidBuyer) => {
        try {
            const saleTx = await nftMarketContract.createMarketSale(nftAddress, itemSelected?.itemId, bidBuyer)
            showSuccess("Item sold successfully")
            await saleTx.wait()
        } catch (e) {
            showError("Failed to sell item")
        }
    }, [itemSelected?.itemId, nftMarketContract])

    if (loadingState === 'loaded' && !nfts.length) {
        return <h1 className="px-20 py-10 text-3xl">No items</h1>
    }

    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items Created</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {nfts.map((nft, index) => (
                        <div key={index} className="border shadow rounded-xl overflow-hidden justify-center">
                            <div className="flex justify-center">
                                <img src={nft.image} alt={nft.name} className="rounded text-center h-56" />
                            </div>
                            <div className="p-4 bg-black flex-grow flex justify-between">
                                <p className="text-2xl font-bold text-white">Price - {nft.price} ETH</p>
                                <button
                                    onClick={() => handleItemSelected(nft)}
                                    className="block text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    type="button">
                                    View Bids
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-4">
                {
                    Boolean(sold.length) && (
                        <div>
                            <h2 className="text-2xl py-2">Items Sold</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {sold.map((nft, index) => (
                                    <div key={index} className="border shadow rounded-xl overflow-hidden">
                                        <div className="flex justify-center">
                                            <img src={nft.image} alt={nft.name} className="rounded h-56" />
                                        </div>
                                        <div className="p-4 bg-black">
                                            <p className="text-2xl font-bold text-white">Price - {nft.price} ETH</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div>
            {showModal ? (
                <>
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative w-full my-6 mx-auto max-w-3xl">
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        NFT details
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => setShowModal(false)}
                                    >
                                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                      ×
                                    </span>
                                    </button>
                                </div>
                                <div className="relative p-6 flex-auto">
                                    <div className="flex justify-center">
                                        <img className="h-72 rounded" src={itemSelected?.image} alt={itemSelected?.name} />
                                    </div>
                                    <div className="flex justify-center">
                                    <div className="p-4 bg-gray-500 rounded-2xl w-1/2">
                                        <p className="text-2xl font-bold text-white">Price - {itemSelected?.price} ETH</p>
                                    </div>
                                    </div>
                                    <BidsList
                                        bids={bids}
                                        itemName={itemSelected?.name}
                                        handleAcceptBid={handleAcceptBid}
                                        showAcceptButton={true}
                                        userAddress={address}
                                    />
                                </div>
                                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </div>
    )
}
