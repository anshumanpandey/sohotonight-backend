import UserModel, { UserAttributes } from "../models/user.model";
import { signAwsUrl } from "../utils/AwsS3Client";

export default async (u: UserModel) => {
    const plainObj: UserAttributes = u.toJSON() as UserAttributes

    return {
        ...plainObj,
        //@ts-expect-error
        Pictures: await Promise.all(plainObj.Pictures.map(async p => ({ ...p, assetUrl: await signAwsUrl({ awsKey: p.awsKey })} )))
    }
}