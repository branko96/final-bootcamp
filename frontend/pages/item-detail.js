import {useCallback, useEffect, useRef, useState} from "react"
import { useRouter } from "next/router"
import nftHelper from "../utils/nftHelper";
import {ethers} from "ethers";
import transactionsService from "../services/transactionsService";
import {useAccount} from "wagmi";
import {useContractsStore} from "../store";
import {showError, showSuccess} from "../utils/toastHelper";
import BidsList from "../components/BidsList";
import {RPC_ADDRESS} from "../constants/rpcAddress";

export default function ItemDetail() {
    const [item, setItem] = useState({})
    const [bids, setBids] = useState([])
    const [itemOwner, setItemOwner] = useState("")
    const [bidAmount, setBidAmount] = useState(0)
    const [price, setPrice] = useState(0)
    const { id } = useRouter().query
    const inputRef = useRef()
    const { isConnected, address } = useAccount()
    const nftMarketContract = useContractsStore((state) => state.nftMarketContract)

    const handleBid = useCallback(async () => {
        try{
            if (bidAmount === 0) {
                showError("Please enter a valid bid amount")
                return
            }
            const provider = new ethers.providers.JsonRpcProvider(RPC_ADDRESS)
            await transactionsService.createBid(nftMarketContract, id, bidAmount)
            showSuccess("Bid created successfully")
            const itemBids = await nftHelper.getNftBids(id, provider)
            setBids(itemBids)
            setBidAmount(0)
        } catch (e) {
            showError("Failed to create bid")
        }
    }, [id, bidAmount, setBidAmount])

    useEffect(() => {
        (async () => {
            try {
                const provider = new ethers.providers.JsonRpcProvider(RPC_ADDRESS)

                if (!id) return
                const itemObject = await nftHelper.getMarketItemById(id, provider)
                const itemDetails = await nftHelper.getNftDetails(itemObject.tokenId, provider)
                const itemBids = await nftHelper.getNftBids(itemObject.tokenId, provider)
                setItem(itemDetails)
                setItemOwner(itemObject.owner)
                setPrice(ethers.utils.formatEther(itemObject.price))
                setItemOwner(itemObject.owner)
                setBids(itemBids)
            } catch (error) {
                showError("Failed to get item data")
            }
        })()
    }, [id, setItem, setItemOwner, setBids])

    return (
        <div className="flex justify-center">
            <div
                className="max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                {item?.image && <img src={item?.image} className="rounded mt-4" width="350" />}
                <div className="p-5">
                    <h5 className="mb-2 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{item?.name}</h5>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{item?.description}</p>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{price.toString()} ETH</p>
                    <button onClick={() => inputRef.current.focus()}
                       className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Make a bid
                        <svg aria-hidden="true" className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd"
                                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                  clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
           <div className="w-1/4 ml-12 justify-center flex flex-col pb-12">
               <h2 className="text-center font-bold text-2xl">Place a bid</h2>
               <input ref={inputRef} className="my-4" type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}/>
               <button disabled={!isConnected || itemOwner === address} onClick={handleBid} className={`w-full bg-indigo-500 text-white font-bold py-2 px-12 rounded ${!isConnected || itemOwner === address && "disabled:opacity-50"}`}>Bid</button>
                <div className="flex justify-center mt-6">
                    <BidsList
                        bids={bids}
                        itemName={item?.name}
                        handleAcceptBid={() => ({})}
                        showAcceptButton={false}
                        userAddress={address}
                    />
                </div>
           </div>
        </div>
    )
}
