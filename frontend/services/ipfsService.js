import { create as ipfsHttpClient } from "ipfs-http-client"

const createFile = async (data) => {
    const client = ipfsHttpClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
    const added = await client.add(data)
    return `https://ipfs.infura.io/ipfs/${added.path}`
}

const ipfsService = {
    createFile
}
export default ipfsService;
