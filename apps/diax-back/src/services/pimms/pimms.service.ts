import { Injectable } from '@nestjs/common';
import { InfoSettingsDto } from '@backend/services/pimms/pimms.dto';
import { getSecrets, ResponsePIMM, type PIMM } from '@repo-hub/internal';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as dynamoose from 'dynamoose';
import { PIMMSchema } from './pimm.schema';

@Injectable()
export class PIMMService {
  constructor(private readonly config: ConfigService) { }

  async getPIMMSCredentials() {
    const secretString = JSON.parse(
      await getSecrets(this.config.get('ID_AUTH_TOKEN'))
    );
    const signingKey = Buffer.from(secretString.signingKey, 'base64');
    const expiresIn = this.config.get('TEMPORAL_TOKEN_EXPIRATION').concat('m');
    const expirationDate = new Date();
    expirationDate.setMinutes(
      expirationDate.getMinutes() + this.config.get('TEMPORAL_TOKEN_EXPIRATION')
    );   
    const temporalToken = sign(
      {
        iot: true,
        timestamp: Date.now(),
      },
      signingKey,
      {
        expiresIn,
        algorithm: 'HS256',
      }
    );   

    return {
      token: {
        sessionToken: temporalToken,
        expiration: expirationDate.toISOString(),
      },
    };
  }

  async getPIMMS(settings: InfoSettingsDto): Promise<ResponsePIMM> {
    const { initTime, endTime, lastID, accUnit: step } = settings.filters;

    let allResults = [];
    const tableName = this.getTableName(step);
    const tableModel = dynamoose.model(tableName, PIMMSchema);

    const partitions = await this.findPartitions(tableModel);

    for (const partition of partitions) {
      let query = tableModel
        .query('PLCNumber')
        .eq(partition)
        .filter('timestamp')
        .attributes(['PLCNumber', 'timestamp', 'payload'])
        .between(initTime, endTime);

      if (lastID) {
        query = query.startAt({
          PLCNumber: partition,
          timestamp: lastID,
        });
      }

      const result = await query.exec();
      const items = result.toJSON().map((item) => item.payload);
      allResults = [...allResults, ...items];
    }

    return {
      pimms: allResults,
      lastID: allResults.at(-1)?.timestamp || null,
      totalProcessed: allResults.length,
    };
  }

  private getTableName(step: string) {
    const buckets: Record<string, string> = {
      second: this.config.get('NAME_TABLE'),
      minute: this.config.get('NAME_TABLE_MINUTE'),
      hour: this.config.get('NAME_TABLE_HOUR'),
    };
    const bucket = buckets[step];
    return bucket;
  }

  private async checkPartitionExists(
    table,
    pimmNumber: number
  ): Promise<boolean> {
    const response = await table
      .query('PLCNumber')
      .eq(pimmNumber)
      .limit(1)
      .exec();
    return response.length > 0;
  }

  private async findPartitions(tableModel) {
    let pimmNumber = 0;
    let falseCount = 0;
    const partitions: number[] = [];

    while (falseCount < 5) {
      if (await this.checkPartitionExists(tableModel, pimmNumber)) {
        partitions.push(pimmNumber);
        falseCount = 0; // Reset false counter since we found a valid partition
      } else {
        falseCount += 1; // Increment false counter
      }
      pimmNumber += 1; // Move to the next number
    }

    return partitions;
  }
}
