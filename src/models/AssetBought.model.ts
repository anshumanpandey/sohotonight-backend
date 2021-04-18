import { Table, Column, Model, ForeignKey, CreatedAt, UpdatedAt, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model';
import VideoModel from './video.model';
import PictureModel from './picture.model';
import { Transaction, WhereAttributeHash, OrOperator } from 'sequelize/types';
import { Op } from 'sequelize';

enum ASSET_TYPE { 'VIDEO' = 'VIDEO', 'PICTURE' = 'PICTURE' }

@Table
export default class AssetBought extends Model {

    @ForeignKey(() => UserModel)
    @Column
    userId: number
    @BelongsTo(() => UserModel)
    user: UserModel

    @ForeignKey(() => VideoModel)
    @Column
    videoId?: number
    @BelongsTo(() => VideoModel)
    video?: VideoModel

    @ForeignKey(() => PictureModel)
    @Column
    pictureId?: number
    @BelongsTo(() => PictureModel)
    picture?: PictureModel

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export const createAssetBought = ({ user, assetId, type }: { user: UserModel, assetId: number, type: ASSET_TYPE }, opt?: { t?: Transaction}) => {
    let assetProp = "videoId"
    if (type == ASSET_TYPE.PICTURE) assetProp = "pictureId"

    return AssetBought.create({ userId: user.id, [assetProp]: assetId }, { transaction: opt?.t })
}

export const findBoughtAssetBy = ({ assetId, userId }: { assetId?: string, userId?: string }) => {
    const where: WhereAttributeHash | OrOperator = {}
    if (assetId) {
        where[Op.or as unknown as string] = [
            { pictureId: assetId },
            { videoId: assetId }
          ]
    }
    if (userId) {
        where.userId = userId
    }
    return AssetBought.findAll({ where: where })
}

export const getAssetBoughtType: (a: AssetBought) => ASSET_TYPE = (asset) => {
    if (asset.picture) return ASSET_TYPE.PICTURE
    return ASSET_TYPE.VIDEO
}