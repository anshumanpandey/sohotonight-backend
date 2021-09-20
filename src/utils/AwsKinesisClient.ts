import AWS from 'aws-sdk';
import { Role } from 'amazon-kinesis-video-streams-webrtc';
import { ApiError } from './ApiError';

export type RoleParams = { role: Role };
export type ChannelNameParams = { videoUuid: string };
export type ArnChannelParams = { arnChannel: string };

const awsConfig = {
  region: 'us-east-2',
  accessKeyId: process.env.AWS_KINESIS_ACCESSKEYID,
  secretAccessKey: process.env.AWS_KINESIS_SECRETACCESSKEY,
};

const kinesisVideoClient = new AWS.KinesisVideo({
  ...awsConfig,
  correctClockSkew: true,
});

export const getActiveSignalingChannel = async (): Promise<AWS.KinesisVideo.ChannelInfoList | undefined> => {
  const activeSignalingChannels = await kinesisVideoClient.listSignalingChannels().promise();

  return activeSignalingChannels.ChannelInfoList;
};

export const getArnChannelNameFrom = async (uuid: string): Promise<string> => {
  const channels = await getActiveSignalingChannel();
  if (!channels) throw new ApiError('Could get find ARN channel');

  const channel = channels.find((i) => i.ChannelARN?.includes(uuid));
  if (!channel) throw new ApiError('Could not find ARN channel');
  if (!channel.ChannelARN) throw new ApiError('Signaling channel has no ARN ddefined');

  return channel.ChannelARN;
};

export const createSignalChannel = async (p: ChannelNameParams): Promise<string | undefined> => {
  const createSignalingChannelResponse = await kinesisVideoClient
    .createSignalingChannel({
      ChannelName: p.videoUuid,
      ChannelType: 'SINGLE_MASTER',
    })
    .promise();
  return createSignalingChannelResponse.ChannelARN;
};

export const deleteSignalingChannel = async (p: ArnChannelParams): Promise<boolean> => {
  await kinesisVideoClient
    .deleteSignalingChannel({
      ChannelARN: `${p.arnChannel}`,
    })
    .promise();

  return true;
};

const getSiganling = async (p: RoleParams & ArnChannelParams) => {
  const getSignalingChannelEndpointResponse = await kinesisVideoClient
    .getSignalingChannelEndpoint({
      ChannelARN: p.arnChannel,
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

export const getIceServers = async (p: RoleParams & ChannelNameParams): Promise<IceServerData | null> => {
  const arnChannel = await getArnChannelNameFrom(p.videoUuid);
  const endpointsByProtocol = await getSiganling({ ...p, arnChannel });
  const kinesisVideoSignalingChannelsClient = await getChannels(endpointsByProtocol);
  const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
    .getIceServerConfig({
      ChannelARN: arnChannel,
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
  return iceServers.pop() || null;
};

export default getIceServers;
