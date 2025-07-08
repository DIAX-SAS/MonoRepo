import mqtt, { MqttClient, Packet} from 'mqtt';
import { fetchCredentialsCore } from '../diax-back/diax-back';

export let clientMQTT: MqttClient | undefined = undefined;

export const connectToMQTTBroker = async (
  topics: string[] | string,
  callback: (topic: string, payload: Buffer, packet: Packet) => void
): Promise<MqttClient> => {
  if (clientMQTT) return clientMQTT;

  const {
    token: { sessionToken },
  } = await fetchCredentialsCore();

  const client = mqtt.connect(process.env.NEXT_PUBLIC_SOCKET_URI || '', {
    username: 'the_username',
    password: sessionToken,
    clientId: `clientId-${Date.now()}-${Math.random().toString(16).substring(2)}`,
    protocolId: 'MQTT',
    protocolVersion: 5,
    clean: true,
    reconnectPeriod: 0,
    connectTimeout: 5000,
    keepalive: 30,
  });

  clientMQTT = client;

  client.on('connect', () => {
    const topicList = Array.isArray(topics) ? topics : [topics];
    for (const topic of topicList) {
      client.subscribe(topic, (err) => {
        if (err) console.error(`Failed to subscribe to ${topic}`, err);
      });
    }
  });

  client.on('message', callback);

  client.on('error', (err) => {
    console.error('MQTT connection error:', err);
  });

  return client;
};

export const closeConnectionToMQTTBroker = async (
  mqttClient: MqttClient | undefined = clientMQTT
): Promise<void> => {
  if (!mqttClient) return;

  mqttClient.end(true, () => {
    console.log('MQTT connection closed');
  });

  clientMQTT = undefined;
};
