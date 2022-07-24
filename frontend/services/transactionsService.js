import { ethers } from "ethers"
import { nftAddress } from "../config"

const createBid = async (nftMarketContract, tokenId, bidAmount) => {
    const amountBid = ethers.utils.parseUnits(bidAmount.toString(), 'ether')

    const transaction = await nftMarketContract.createBid(tokenId, {
        value: amountBid
    })

    await transaction.wait()
}

const createItem = async (nftContract, nftMarketContract, url, inputPrice) => {
    const transaction = await nftContract.createToken(url)
    const tx = await transaction.wait()
    console.log(transaction, tx);
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(inputPrice, 'ether')

    let listingPrice = await nftMarketContract.getListingPrice()
    listingPrice = listingPrice.toString()

    const listingTransaction = await nftMarketContract.createMarketItem(nftAddress, tokenId, price, {
        value: listingPrice
    })
    return listingTransaction.wait()
}

const reSellItem = async (nftContract, nftMarketContract, tokenId, inputPrice) => {
    const price = ethers.utils.parseUnits(inputPrice, 'ether')

    let listingPrice = await nftMarketContract.getListingPrice()
    listingPrice = listingPrice.toString()

    const listingTransaction = await nftMarketContract.createMarketItem(nftAddress, tokenId, price, {
        value: listingPrice
    })
    return listingTransaction.wait()
}

const transactionsService = {
    createItem,
    createBid,
    reSellItem
}
export default transactionsService
