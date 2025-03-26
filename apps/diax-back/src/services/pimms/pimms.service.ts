import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as dynamoose from 'dynamoose';
import { GetPimmsDTO, PIMMSchema } from './pimms.schema';
import { GetPimmsResponseDTO, PimmsFilterDto } from './pimms.dto';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class PimmsService {
  tableName: Record<string, string>;
  iotSecretId: string;
  accessKeyId: string;
  secretAccessKey: string;
  constructor(private readonly config: ConfigService) {
    this.tableName = {
      second: this.config.get('BASE_TABLE_NAME'),
      minute: this.config.get('MINUTE_TABLE_NAME'),
      hour: this.config.get('HOUR_TABLE_NAME'),
    };
    this.iotSecretId = this.config.get('IOT_AUTH_SECRET_PATH');
    this.accessKeyId = this.config.get('AWS_ACCESS_KEY_ID');
    this.secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY');
  }

  async getPimmsIotCredentials() {
    const smClient = new SecretsManagerClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    const { SecretString } = await smClient.send(
      new GetSecretValueCommand({ SecretId: this.iotSecretId })
    );

    const { signingKey } = JSON.parse(SecretString);
    const key = Buffer.from(signingKey, 'base64');

    const token = sign({ iot: true, timestamp: Date.now() }, key, {
      expiresIn: '10m',
      algorithm: 'HS256',
    });

    return {
      token: {
        sessionToken: token,
        expiration: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      },
    };
  }

  async getPIMMS(settings: PimmsFilterDto): Promise<GetPimmsResponseDTO> {
    const { initTime, endTime, lastID, stepUnit } = settings;

    const tableModel = dynamoose.model(this.tableName[stepUnit], PIMMSchema);

    const partitions = Array.from({ length: 100 + 1 }, (_, i) => i);
    const rawItems = await Promise.all(
      partitions.map(async (partition) => {
        return (
          await tableModel
            .query('plcId')
            .eq(partition)
            .where('timestamp')
            .between(lastID || initTime, endTime)
            .attributes(['plcId', 'timestamp', 'counters', 'states'])
            .exec()
        ).toJSON();
      })
    );
    const pimms = rawItems.flat() as GetPimmsDTO[];

    return {
      pimms,
      lastID: pimms.at(-1)?.timestamp ?? null,
      totalProcessed: pimms.length,
    };
  }
}
