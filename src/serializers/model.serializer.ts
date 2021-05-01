import express from 'express';
import UserModel, { UserAttributes } from "../models/user.model";
import { signAwsUrl } from "../utils/AwsS3Client";

export const ownModelSerializer = async (u: UserModel) => {
    const plainObj: UserAttributes = u.toJSON() as UserAttributes

    return {
        ...plainObj,
        //@ts-expect-error
        Pictures: await Promise.all(plainObj.Pictures.map(async p => ({ ...p, assetUrl: await signAwsUrl({ awsKey: p.awsKey })} ))),
        //@ts-expect-error
        Videos: await Promise.all(plainObj.Videos.map(async p => ({ ...p, assetUrl: await signAwsUrl({ awsKey: p.awsKey })} )))
    }
}

export const publicModelSerializer = async (u: UserModel, req: any) => {
    const plainObj: UserAttributes = u.toJSON() as UserAttributes
    return {
        ...plainObj,
        //@ts-expect-error
        Pictures: await Promise.all(plainObj.Pictures.map(async p => {
            if (p.isFree) {
                return ({ ...p, assetUrl: await signAwsUrl({ awsKey: p.awsKey })})

            } else {
                return ({ ...p, assetUrl: `${req.protocol + '://' + req.get('host')}/assets/soho-watchme.png` })
            }
        })),
        //@ts-expect-error
        Videos: await Promise.all(plainObj.Videos.map(async p => {
            if (p.isFree) {
                return ({ ...p, assetUrl: await signAwsUrl({ awsKey: p.awsKey })})
            } else {
                return ({ ...p, assetUrl: `${req.protocol + '://' + req.get('host')}/assets/mov_bbb.mp4` })
            }
        }))
    }
}

export const userSerializerFactory = ({ req, user}: { req: express.Request<any, any, any, any>, user: UserModel}) => {
    if (req?.user?.id == user?.id) {
        return ownModelSerializer(user)
    }

    return publicModelSerializer(user, req)
}

export default publicModelSerializer