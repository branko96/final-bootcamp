import { ethers } from "ethers"
import { nftAddress, nftMarketAddress } from "../config"
import NFT from "../artifacts/NFT.json"
import NFTMarket from "../artifacts/NFTMarket.json"
import axios from "axios"

const loadNFTs = async (data, getTokenURI, nftContract) => {
    return Promise.all(data.map(async item => {
        const tokenUri = await getTokenURI(nftContract, item.tokenId);
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(item.price.toString(), 'ether')

        return {
            price,
            itemId: item.itemId.toNumber(),
            tokenId: item.tokenId.toNumber(),
            seller: item.seller,
            owner: item.owner,
            sold: item.sold,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
        }
    }))
}

const getNftDetails = async (tokenId, provider) => {
    const { nftContract } = getContracts(provider)
    const tokenUri = await getTokenURI(nftContract, tokenId);
    const meta = await axios.get(tokenUri)

    return {
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
    }
}

const getTokenURI = async (nftContract, tokenId) => {
    return await nftContract.tokenURI(Number(tokenId))
}

const getContracts = (provider) => {
    const nftContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const nftMarketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, provider)

    return {
        nftContract,
        nftMarketContract
    }
}

const createdItems = async (nftMarketContract, nftContract) => {
    const data = await nftMarketContract.fetchItemsCreated()
    return loadNFTs(data, getTokenURI, nftContract)
}
const marketItems = async (provider) => {
    const { nftContract, nftMarketContract } = getContracts(provider)
    const data = await nftMarketContract.fetchMarketItems()
    return loadNFTs(data, getTokenURI, nftContract)
}

const myItems = async (nftMarketContract, nftContract) => {
    const data = await nftMarketContract.fetchMyNfts()
    const tokenIds = []
    const filtered = data.filter(o => {
        if (!tokenIds.includes(o.tokenId.toString())) {
            tokenIds.push(o.tokenId.toString())
            return true
        }
        return false
    })
    return loadNFTs(filtered, getTokenURI, nftContract)
}

const getMarketItemById = async (id, provider) => {
    const { nftMarketContract } = getContracts(provider)
    const data = await nftMarketContract.getItemById(id)
    return data
}

const getNftBids = async (id, provider) => {
    const { nftMarketContract } = getContracts(provider)
    const data = await nftMarketContract.fetchBidsOfItem(id)
    return data
}

const nftHelper = {
    createdItems,
    marketItems,
    myItems,
    getNftDetails,
    getMarketItemById,
    getNftBids
}

export default nftHelper
