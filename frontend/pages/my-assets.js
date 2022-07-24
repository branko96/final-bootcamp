import { useCallback, useEffect, useState } from "react"
import nftHelper from "../utils/nftHelper"
import { useContractsStore } from "../store";
import shallow from "zustand/shallow";
import transactionsService from "../services/transactionsService";
import { showError, showSuccess } from "../utils/toastHelper";

export default function MyAssets() {
    const [nfts, setNfts] = useState([])
    const [price, setPrice] = useState(0)
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [nftMarketContract, nftContract] = useContractsStore((state) => [state.nftMarketContract, state.nftContract], shallow)

    useEffect(() => {
        (async () => {
            nftHelper.myItems(nftMarketContract, nftContract).then(items => {
                setNfts(items)
                setLoadingState('loaded')
            })
        })()
    }, [nftMarketContract, nftContract])

    const publishItem = useCallback(async (nftSelected) => {
        if (price <= 0) {
            showError("Please enter a valid price")
            return
        }
        transactionsService.reSellItem(nftContract,nftMarketContract, nftSelected.tokenId, price).then(() => {
            showSuccess("Item published successfully")
        }).catch((err) => {
            showError("Failed to publish item")
            console.log(err)
        })
    }, [nftContract,nftMarketContract, price])

    if (loadingState === 'loaded' && !nfts.length) {
        return <h1 className="px-20 py-10 text-3xl">No items</h1>
    }

    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pt-4">
                    {nfts.map((nft, index) => (
                        <div key={index} className="border shadow rounded-xl overflow-hidden">
                            <img src={nft.image} alt={nft.name} className="rounded mx-auto" />
                            <div className="p-4 bg-black">
                                <p className="text-2xl font-bold text-white">Price - {nft.price} ETH</p>
                            </div>
                            {nft.sold && <div className="text-center">
                                <input
                                    placeholder="Asset Price"
                                    type="number"
                                    className="mt-8 border rounded p-4"
                                    onChange={(e) =>
                                        setPrice(e.target.value)
                                    }
                                />
                                <button
                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                    onClick={() => publishItem(nft)}
                                >
                                    Publish to sell
                                </button>
                            </div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
