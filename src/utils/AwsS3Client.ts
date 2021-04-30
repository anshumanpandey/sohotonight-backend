import AWS from "aws-sdk"
import { differenceInSeconds } from "date-fns";

export const AWS_BUCKET = 'soho-assets'

export const S3Client = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    signatureVersion: 'v4',
    region: 'us-east-2'
});

export interface AwsFileSigning {
    awsKey: string
    expireAtSeconds?: number | Date
}
export const signAwsUrl = ({ awsKey, expireAtSeconds = 60 * 5 }: AwsFileSigning ) => {
    const Expires = expireAtSeconds instanceof Date ? differenceInSeconds(expireAtSeconds, new Date()) : expireAtSeconds
    const url = S3Client.getSignedUrl('getObject', {
        Bucket: AWS_BUCKET,
        Key: awsKey,
        Expires
    });

    return url
}