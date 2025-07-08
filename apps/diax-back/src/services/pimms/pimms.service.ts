import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { GetPimmsDTO, GetPimmsResponseDTO, PIMMDocumentKey, PimmsFilterDto } from './pimms.interface';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { EmailService } from '../email/email.service';

@Injectable()
export class PimmsService {
  iotSecretId: string;
  accessKeyId: string;
  secretAccessKey: string;
  endPointSecrets: string;
  constructor(
    private readonly config: ConfigService,
    private readonly email: EmailService,
    @InjectModel("PIMM") private PIMMModel: Model<GetPimmsDTO, PIMMDocumentKey>,
    @InjectModel("PIMMMinute") private PIMMMinuteModel: Model<GetPimmsDTO, PIMMDocumentKey>,
    @InjectModel("PIMMHour") private PIMMHourModel: Model<GetPimmsDTO, PIMMDocumentKey>
  ) {
    this.iotSecretId = this.config.get('IOT_AUTH_SECRET_PATH');
    this.accessKeyId = this.config.get('AWS_ACCESS_KEY_ID');
    this.secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY');
    this.endPointSecrets = this.config.get("SECRETS_MANAGER_URI")
  }

  async getPimmsIotCredentials() {
    const isDev = process.env.NODE_ENV === 'development';
    const smClient = new SecretsManagerClient({
      region: 'us-east-1',
      endpoint: this.endPointSecrets,
      ...(isDev && {
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,        },
      }),
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

    let tableModel: Model<GetPimmsDTO, PIMMDocumentKey>;
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

    /**
  * Generates an array of epoch timestamps (in seconds) for each day 
  * between `initTime` and `endTime` (inclusive), normalized to 00:00:00 UTC.
  *
  * @param {number} initTime - The start timestamp (in milliseconds).
  * @param {number} endTime - The end timestamp (in milliseconds).
  * @returns {number[]} An array of timestamps (in seconds) representing each day.
  */
    function getPartitions(initTime: number, endTime: number): number[] {
      const ONE_DAY_MS = 86400000; 
   
      const start = new Date(initTime);
      start.setUTCHours(0, 0, 0, 0);
    
      const end = new Date(endTime);
      end.setUTCHours(0, 0, 0, 0);
     
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / ONE_DAY_MS) + 1;
    
      return Array.from({ length: totalDays }, (_, i) =>
        (start.getTime() + i * ONE_DAY_MS) 
      );
    }

    const partitions = getPartitions(initTime, endTime);

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
        );
      })
    );
    const pimms = rawItems.flat() as GetPimmsDTO[];

    return {
      pimms,
      lastID: pimms.at(-1)?.timestamp ?? null,
      totalProcessed: pimms.length,
    };
  }

  async sendPimmReport(address: string){   
    const subject = "REPORTE EMPLEADOS OEE";
    const content = "test";
    return this.email.sendEmail(address, content, subject)
  }
}
