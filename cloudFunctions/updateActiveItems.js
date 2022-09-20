Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed")

    const objectId = request.object.get("objectId")
    const address = request.object.get("address")
    const nftAddress = request.object.get("nftAddress")
    const price = request.object.get("price")
    const tokenId = request.object.get("tokenId")
    const seller = request.object.get("seller")

    const logger = Moralis.Cloud.getLogger()
    logger.info("Looging for confirmed Tx")

    if (confirmed) {
        logger.info("Found Item!")
        const ActiveItem = Moralis.Object.extend("ActiveItem")

        const query = new Moralis.Query(ActiveItem)
        query.equalTo("nftAddress", nftAddress)
        query.equalTo("tokenId", tokenId)
        query.equalTo("marketplaceAddress", address)
        query.equalTo("seller", seller)
        logger.info(`Marketplace | Query: ${query}`)
        const alreadyListedItem = await query.first()
        if (alreadyListedItem) {
            logger.info(`Deleting already listed ${objectId} `)
            await alreadyListedItem.destroy()
            logger.info(
                `Deleted item with tokenId ${tokenId} at address ${address} since it's already been listed`
            )
        }

        const activeItem = new ActiveItem()
        activeItem.set("marketplaceAddress", address)
        activeItem.set("nftAddress", nftAddress)
        activeItem.set("price", price)
        activeItem.set("tokenId", tokenId)
        activeItem.set("seller", seller)
        logger.info(`Adding Address: ${address}. TokenId: ${tokenId}`)
        logger.info("Saving...")
        await activeItem.save()
    }
})

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`Marketplace | Object: ${request.object}`)
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))

        logger.info(`Marketplace | Query: ${query}`)
        const canceledItem = await query.first()
        logger.info(`Marketplace | CanceledItem: ${canceledItem}`)
        if (canceledItem) {
            logger.info(
                `Deleting: ${request.object.get("tokenId")} at address ${request.object.get(
                    "address"
                )} since it was canceled`
            )
            await canceledItem.destroy()
        } else {
            logger.info(
                `No item found with address ${request.object.get(
                    "address"
                )} and tokenId: ${request.object.get("tokenId")}`
            )
        }
    }
})

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed")

    const address = request.object.get("address")
    const nftAddress = request.object.get("nftAddress")
    const tokenId = request.object.get("tokenId")

    const logger = Moralis.Cloud.getLogger()
    logger.info(`Marketplace | Object: ${request.object}`)
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", address)
        query.equalTo("nftAddress", nftAddress)
        query.equalTo("tokenId", tokenId)

        logger.info(`Marketplace | Query: ${query}`)
        const boughtItem = await query.first()
        if (boughtItem) {
            logger.info(`Deleting item with Token ID ${tokenId} at address ${address}`)
            await boughtItem.destroy()
        } else {
            logger.info(`No item found with address: ${address} and token id: ${tokenId}`)
        }
    }
})
