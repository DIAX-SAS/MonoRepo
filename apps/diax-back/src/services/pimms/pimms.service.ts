import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { GetPimmsDTO, GetPimmsResponseDTO, PIMMDocumentKey, PimmsFilterDto } from './pimms.interface';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { InjectModel, Model } from 'nestjs-dynamoose';

@Injectable()
export class PimmsService {
  iotSecretId: string;
  accessKeyId: string;
  secretAccessKey: string;
  constructor(
    private readonly config: ConfigService,
    @InjectModel("PIMM") private PIMMModel: Model<GetPimmsDTO, PIMMDocumentKey>,
    @InjectModel("PIMMMinute") private PIMMMinuteModel: Model<GetPimmsDTO, PIMMDocumentKey>,
    @InjectModel("PIMMHour") private PIMMHourModel: Model<GetPimmsDTO, PIMMDocumentKey>
  ) {
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

    let tableModel;
    switch (stepUnit) {
      case "second":
      default:
        tableModel = this.PIMMModel;
        break;
      case "minute":
        tableModel = this.PIMMMinuteModel;
        break;
      case "hour":
        tableModel = this.PIMMHourModel;
        break;

    }

    // TODO: make more legible
    // Returns an array of epoch timestamps (in seconds) for each day between initTime and endTime (inclusive)
    const partitions = Array.from({ length: Math.ceil((endTime - initTime) / 86400000) + 1 },
      (_, i) => Math.floor((initTime + i * 86400000) / 1000));

    const rawItems = await Promise.all(
      partitions.map(async (partition) => {
        return (
          await tableModel
            .query('epochDay')
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
