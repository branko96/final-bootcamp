import {ethers} from "ethers";


function BidsList({ bids, itemName, showAcceptButton = false, handleAcceptBid, userAddress }) {
    if (bids.length === 0) {
        return (
            <div className="px-4">
                <h2 className="text-2xl py-2">No bids yet</h2>
            </div>
        )
    }
    return (<div>
        <h4 className="mt-4 text-2xl font-bold text-gray-700">
            Bids of item: {itemName}
        </h4>
        <ul className="mt-2 w-full text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            {bids.map(bid => {
                return (
                    <li key={bid.itemId.toString()} className="py-2 px-4 w-full rounded-t-lg border-b border-gray-200 dark:border-gray-600">
                        <div className="flex-row flex justify-between items-center">
                            <div>
                                <h5>{bid.buyer === userAddress ? 'You' : bid.buyer}</h5>
                                <h6 className="text-indigo-500">{ethers.utils.formatUnits(bid.value.toString(), "ether")} ETH</h6>
                            </div>
                            {showAcceptButton && <div>
                                <button className="text-emerald-500" onClick={() => handleAcceptBid(bid.buyer)}>Accept</button>
                            </div>}
                        </div>
                    </li>
                )
            })}
        </ul>
    </div>)
}

export default BidsList;
