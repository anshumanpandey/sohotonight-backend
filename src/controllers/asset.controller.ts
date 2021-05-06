import express from 'express';
import VideoModel from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import PictureModel from '../models/picture.model';
import UserModel, { discountUserToken } from '../models/user.model';
import { createAssetBought, findBoughtAssetBy, FindBoughtAssetByParams } from '../models/AssetBought.model';
import sequelize from '../utils/DB';
import { signAwsUrl } from '../utils/AwsS3Client';

export const buyAssetController: express.RequestHandler = async (req, res) => {
    await sequelize.transaction(async (t) => {
        const { assetType, assetId, userId } = req.body

        let asset = null
        const query = { id: assetId, userId }
        if (assetType == "VIDEO") {
            asset = await VideoModel.findOne({ where: query, transaction: t })
        }
        if (assetType == "PICTURE") {
            asset = await PictureModel.findOne({ where: query, transaction: t })
        }
        if (!asset) throw new ApiError("Asset not found")
        if (asset.isFree == true || !asset.price) throw new ApiError("This is a free asset")

        const assetBoughtParams: FindBoughtAssetByParams = { userId: req.user.id }
        if (assetType == "VIDEO") {
            assetBoughtParams.videoId = asset.id
        }
        if (assetType == "PICTURE") {
            assetBoughtParams.pictureId = asset.id
        }
        const assetsBouhgt = await findBoughtAssetBy(assetBoughtParams)
        if (assetsBouhgt.length != 0) throw new ApiError("Asset already bought")

        const currentUser = await UserModel.findByPk(req.user.id, { transaction: t })
        if (!currentUser) throw new ApiError("User not found")
        if (currentUser.tokensBalance < asset.price) throw new ApiError("Insuficient token balance")

        await discountUserToken({ user: currentUser, amount: asset.price }, { t })
        await createAssetBought({ user: currentUser, assetId: asset.id, type: assetType }, { t })

        res.send({ response: "success" });
    })
}

export const generateAssetUrlController: express.RequestHandler = async (req, res) => {
    await sequelize.transaction(async (t) => {
        const { assetType, assetId } = req.body
        const { id: userId } = req.user

        const [assetsBouhgt] = await findBoughtAssetBy({ assetId: assetId, userId: req.user.id })
        if (!assetsBouhgt) throw new ApiError("Asset not bought")

        let asset = null
        const query = { id: assetId }
        if (assetType == "VIDEO") {
            asset = await VideoModel.findOne({ where: query, transaction: t })
        }
        if (assetType == "PICTURE") {
            asset = await PictureModel.findOne({ where: query, transaction: t })
        }
        if (!asset) throw new ApiError("Asset not found")

        const downloadUrl = signAwsUrl(asset)

        res.send({ url: downloadUrl });
    })
}