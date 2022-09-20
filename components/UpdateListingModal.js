import { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import { Modal, Input, useNotification } from "web3uikit"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"

export default function UpdateListingModal({
    isVisible,
    nftAddress,
    tokenId,
    marketplaceAddress,
    onClose,
}) {
    const dispatch = useNotification()

    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0)

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "listing update",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }

    const { runContractFunction: updateListing } = useWeb3Contract({
        chain: 31337,
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    })

    return (
        <>
            <Modal
                isVisible={isVisible}
                tokenId={tokenId}
                marketplaceAddress={marketplaceAddress}
                nftAddress={nftAddress}
                onCancel={onClose}
                onCloseButtonPressed={onClose}
                onOk={() => {
                    console.log(
                        `marketplaceAddress: ${marketplaceAddress} 
                        | nftAddress: ${nftAddress} 
                        | tokenId: ${tokenId} 
                        | newPrice: ${ethers.utils.parseEther(priceToUpdateListingWith || "0")}`
                    )
                    updateListing({
                        onError: (error) => console.log(error),
                        onSuccess: handleUpdateListingSuccess,
                    })
                }}
            >
                <Input
                    label="UpdateListing price in L1 currency (ETH)"
                    name="New listing price"
                    type="number"
                    onChange={(event) => {
                        setPriceToUpdateListingWith(event.target.value)
                    }}
                    inOk={() => {}}
                ></Input>
            </Modal>
        </>
    )
}
