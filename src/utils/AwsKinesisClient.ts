import AWS from 'aws-sdk';
import { Role } from 'amazon-kinesis-video-streams-webrtc';
import { ApiError } from './ApiError';

export type RoleParams = { role: Role };

const CHANNEL_ARN = 'arn:aws:kinesisvideo:us-east-2:678467088006:channel/soho/1631206530796';

const awsConfig = {
  region: 'us-east-2',
  accessKeyId: process.env.AWS_KINESIS_ACCESSKEYID,
  secretAccessKey: process.env.AWS_KINESIS_SECRETACCESSKEY,
};

const kinesisVideoClient = new AWS.KinesisVideo({
  ...awsConfig,
  correctClockSkew: true,
});

const getSiganling = async (p: RoleParams) => {
  const getSignalingChannelEndpointResponse = await kinesisVideoClient
    .getSignalingChannelEndpoint({
      ChannelARN: CHANNEL_ARN,
      SingleMasterChannelEndpointConfiguration: {
        Protocols: ['WSS', 'HTTPS'],
        Role: p.role,
      },
    })
    .promise();

  if (!getSignalingChannelEndpointResponse.ResourceEndpointList) {
    throw new ApiError('Could not get SignalingChannelEndpoint');
  }

  const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce<Record<string, string>>(
    (record, endpoint) => {
      const endpoints = { ...record };
      const protocol = endpoint.Protocol;
      if (!protocol) return endpoints;
      if (!endpoint.ResourceEndpoint) return endpoints;

      endpoints[protocol] = endpoint.ResourceEndpoint;
      return endpoints;
    },
    {},
  );

  return endpointsByProtocol;
};

const getChannels = async (endpointsByProtocol: Record<string, string>) => {
  const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
    ...awsConfig,
    endpoint: endpointsByProtocol.HTTPS,
    correctClockSkew: true,
  });

  return kinesisVideoSignalingChannelsClient;
};

export type IceServerData = { urls: string | string[]; username?: string; credential?: string };

export const getIceServers = async (p: RoleParams): Promise<IceServerData[]> => {
  const endpointsByProtocol = await getSiganling(p);
  const kinesisVideoSignalingChannelsClient = await getChannels(endpointsByProtocol);
  const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
    .getIceServerConfig({
      ChannelARN: CHANNEL_ARN,
    })
    .promise();
  const iceServers: IceServerData[] = [{ urls: `stun:stun.kinesisvideo.${awsConfig.region}.amazonaws.com:443` }];
  if (!getIceServerConfigResponse.IceServerList) {
    throw new ApiError('Could not get IceServerConfig');
  }
  getIceServerConfigResponse.IceServerList.forEach((iceServer) => {
    if (!iceServer.Uris) return;

    iceServers.push({
      urls: iceServer.Uris,
      username: iceServer.Username,
      credential: iceServer.Password,
    });
  });
  return iceServers;
};

export default getIceServers;
