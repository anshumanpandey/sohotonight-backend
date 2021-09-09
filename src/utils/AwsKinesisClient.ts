import AWS from "aws-sdk"
import { Role } from 'amazon-kinesis-video-streams-webrtc';
import { ApiError } from "./ApiError";

const CHANNEL_ARN = 'arn:aws:kinesisvideo:us-east-2:678467088006:channel/soho/1631206530796'

const awsConfig = {
    region: 'us-east-2',
    accessKeyId: process.env.AWS_KINESIS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_KINESIS_ACCESSKEYID,
}

const kinesisVideoClient = new AWS.KinesisVideo({
    ...awsConfig,
    correctClockSkew: true,
});

const getSiganling = async () => {
    const getSignalingChannelEndpointResponse = await kinesisVideoClient
    .getSignalingChannelEndpoint({
        ChannelARN: CHANNEL_ARN,
        SingleMasterChannelEndpointConfiguration: {
            Protocols: ['WSS', 'HTTPS'],
            Role: Role.VIEWER,
        },
    })
    .promise()

    if (!getSignalingChannelEndpointResponse.ResourceEndpointList) {
        throw new ApiError("Could not get SignalingChannelEndpoint")
    }

const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce<Record<string, string>>((endpoints, endpoint) => {
    const protocol = endpoint.Protocol;
    if (!protocol) return endpoints
    if (!endpoint.ResourceEndpoint) return endpoints

    endpoints[protocol] = endpoint.ResourceEndpoint;
    return endpoints;
}, {});

return endpointsByProtocol
}

const getChannels = async () => {
    const endpointsByProtocol = await getSiganling();

const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
    ...awsConfig,
    endpoint: endpointsByProtocol["HTTPS"],
    correctClockSkew: true,
});

return kinesisVideoSignalingChannelsClient
}


export const getIceServers = async () => {

    const kinesisVideoSignalingChannelsClient = await getChannels()
    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
    .getIceServerConfig({
        ChannelARN: CHANNEL_ARN,
    })
    .promise();
const iceServers: { urls: string | string[], username?: string, credential?: string}[] = [
    { urls: `stun:stun.kinesisvideo.${awsConfig.region}.amazonaws.com:443` }
];
if (!getIceServerConfigResponse.IceServerList) {
    throw new ApiError("Could not get IceServerConfig");
}
getIceServerConfigResponse.IceServerList.forEach(iceServer => {
    if (!iceServer.Uris) return 

    iceServers.push({
        urls: iceServer.Uris,
        username: iceServer.Username,
        credential: iceServer.Password,
    })

});
    return iceServers;

}