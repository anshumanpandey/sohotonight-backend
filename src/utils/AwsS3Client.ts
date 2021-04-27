import AWS from "aws-sdk"

export const AWS_BUCKET = 'soho-assets'

export const S3Client = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    signatureVersion: 'v4',
    region: 'us-east-2'
});

export interface AwsFile {
    awsKey: string
}
export const signAwsUrl = ({ awsKey }: AwsFile ) => {
    const signedUrlExpireSeconds = 60 * 5
    const url = S3Client.getSignedUrl('getObject', {
        Bucket: AWS_BUCKET,
        Key: awsKey,
        Expires: signedUrlExpireSeconds
    });

    return url
}