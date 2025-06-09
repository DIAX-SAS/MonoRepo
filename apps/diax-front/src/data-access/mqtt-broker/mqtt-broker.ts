import mqtt, { Packet } from 'mqtt';
import { RefObject } from 'react';
import { fetchCredentialsCore } from '../diax-back/diax-back';

export const connectToMQTTBroker = async (
    MQTTRef: RefObject<mqtt.MqttClient | undefined>,
    topics: string[] | string,
    callback: (topic: string, payload: Buffer, packet: Packet) => void
): Promise<mqtt.MqttClient> => {
    if (MQTTRef?.current) {
        return MQTTRef.current;
    }

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

    if (MQTTRef) {
        MQTTRef.current = client;
    }
    client.on('connect', () => {
        topics = Array.isArray(topics) ? topics : [topics];
        for (const topic of topics) {
            client.subscribe(topic);
        }
    });

    client.on('message', callback);

    client.on('error', (err) => {
        console.error('MQTT connection error:', err);
    });
    return client;
};

export const closeConnectionToMQTTBroker = (
    MQTTRef: RefObject<mqtt.MqttClient | undefined>
) => {
    MQTTRef.current?.unsubscribe('PIMMStateTopic');
    MQTTRef.current?.end();
    MQTTRef.current = undefined;
}
