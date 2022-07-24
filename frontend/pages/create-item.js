import { useCallback, useState } from "react"
import { useRouter } from "next/router"
import ipfsService from "../services/ipfsService"
import transactionsService from "../services/transactionsService"
import { useContractsStore } from "../store";
import shallow from "zustand/shallow";
import { showError, showSuccess } from "../utils/toastHelper";

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [formInput, setFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()
    const [nftMarketContract, nftContract] = useContractsStore((state) => [state.nftMarketContract, state.nftContract], shallow)

    const onChange = useCallback( (e) => {
        const file = e.target.files[0]
        if (!file) return
        ipfsService.createFile(file).then((filePath) => {
            setFileUrl(filePath)
        })
    }, [setFileUrl])

    const createItem = useCallback(async () => {
        setIsLoading(true)
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) {
            return
        }
        const data = JSON.stringify({ name, description, image: fileUrl })
        ipfsService.createFile(data).then((filePath) => {
            transactionsService.createItem(nftContract,nftMarketContract, filePath, formInput.price).then(() => {
                showSuccess("Item created successfully")
                setIsLoading(false)
                router.push('/')
            }).catch((err) => {
                showError("Failed to create item")
                console.log(err)
                setIsLoading(false)
            })
        })
    }, [formInput, nftContract,nftMarketContract, fileUrl, router])

    return (
        <div className="flex justify-center">
           <div className="w-1/2 flex flex-col pb-12">
               <div className="flex-1 justify-center">
                   {fileUrl && <img src={fileUrl} className="rounded mt-4 mx-auto" width="250" />}
               </div>
               <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={(e) =>
                      setFormInput({...formInput, name: e.target.value})
                    }
               />
               <textarea
                   placeholder="Asset Description"
                   className="mt-8 border rounded p-4"
                   onChange={(e) =>
                       setFormInput({...formInput, description: e.target.value})
                   }
               />
               <input
                   placeholder="Asset Price"
                   type="number"
                   className="mt-8 border rounded p-4"
                   onChange={(e) =>
                       setFormInput({...formInput, price: e.target.value})
                   }
               />
               <input
                   type="file"
                   name="asset"
                   placeholder="Asset Price"
                   className="my-4"
                   onChange={onChange}
               />
               <button
                   onClick={createItem}
                   className="flex bg-indigo-500 font-bold mt-4 p-4 shadow-lg text-white rounded justify-center items-center"
               >
                   {isLoading && <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                               strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor"
                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                       </path>
                   </svg>}
                   <span>Create Item</span>
               </button>
           </div>
        </div>
    )
}
