import { Injectable } from '@nestjs/common';
import { S3Client, ListObjectsV2Command, GetObjectCommand, type _Object } from '@aws-sdk/client-s3';
import * as zlib from 'zlib';
import { Readable } from 'stream';
import { InfoSettingsDto } from '@backend/dto/info-settings.dto';
import { PIMMState } from '@repo-hub/internal';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

interface ProcessedResult {
  pimmStates: PIMMState[];
  lastID: number | null;
  hasMore: boolean;
  totalProcessed: number;
}

@Injectable()
export class PIMMService {
  constructor(private readonly config: ConfigService) { }
  private readonly s3 = new S3Client({ region: this.config.get('AWS_REGION') });
  private client = new SecretsManagerClient({ region: this.config.get('AWS_REGION') });
  private clientDynamo = new DynamoDBClient({ region: this.config.get('AWS_REGION') });

  async generateTemporalToken() {

    const secretResponse = await this.client.send(
      new GetSecretValueCommand({ SecretId: this.config.get('ID_AUTH_TOKEN') })
    );
    const secretString = JSON.parse(secretResponse.SecretString);
    const signingKey = Buffer.from(secretString.signingKey, 'base64');


    const expiresIn = this.config.get('TEMPORAL_TOKEN_EXPIRATION').concat('m');
    const temporalToken = sign(
      {
        iot: true,
        timestamp: Date.now()
      },
      signingKey,
      {
        expiresIn,
        algorithm: 'HS256'
      }
    );
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + this.config.get('TEMPORAL_TOKEN_EXPIRATION'));

    return {
      sessionToken: temporalToken,
      expiration: expirationDate.toISOString()
    };
  }

  async getPIMMStatesFromS3(settings: InfoSettingsDto): Promise<ProcessedResult> {
    return this.paginateFolders(settings);
  }

  async getPIMMStatesFromDynamoDB(settings: InfoSettingsDto): Promise<ProcessedResult> {
    const { initTime, endTime, lastID, length } = settings.filters;

   
    const startDate = new Date((!lastID) ? initTime : lastID).toISOString().split("T")[0];
    const endDate = new Date(endTime).toISOString().split("T")[0];

    const currentDate = new Date(startDate);
    const partitions: string[] = [];

    // Get all dates between `initTime` and `endTime`
    while (currentDate.toISOString().split("T")[0] <= endDate) {
      partitions.push(new Date(currentDate.toISOString().split("T")[0]).getTime().toString());
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let allResults = [];
    let hasMore = false;
    let newLastID = null;

    for (const partition of partitions) {
      const params = {
        TableName: "PIMMs",
        KeyConditionExpression: "#pd = :date AND #ts BETWEEN :initTime AND :endTime",
        ExpressionAttributeNames: {
          "#pd": "partitionDate",
          "#ts": "timestamp"
        },
        ExpressionAttributeValues: {
          ":date": { N: partition },
          ":initTime": { N: initTime.toString() },
          ":endTime": { N: endTime.toString() }
        },
        Limit: length - allResults.length,
        ScanIndexForward: false // Get latest records first
      };

      // Handle pagination across partitions
      if (lastID) {
        params["ExclusiveStartKey"] = {
          partitionDate: { N: partition },
          timestamp: { N: lastID.toString() }
        };
      }

      const result = await this.clientDynamo.send(new QueryCommand(params));
      const items = result.Items.map(item => {
        const unmarshalledItem = unmarshall(item);
        return unmarshalledItem.payload as PIMMState;
      });

      allResults = [...allResults, ...items];

      if (result.LastEvaluatedKey) {
        hasMore = true;
        newLastID = Number(result.LastEvaluatedKey.timestamp.N);
        break; // Stop fetching if we hit the requested `length`
      }

      // Stop if we already got enough results
      if (allResults.length >= length) {
        break;
      }
    }

    return {
      pimmStates: allResults,
      lastID: newLastID,
      hasMore: hasMore,
      totalProcessed: allResults.length
    };
  }
  
  private generateFolders(initTime: number, endTime: number): string[] {
    const start = new Date(initTime);
    const end = new Date(endTime);
    const folders: string[] = [];
    
    const current = new Date(start.getTime());
    current.setMinutes(0, 0, 0); // Set to the start of the hour
    
    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const hour = String(current.getHours()).padStart(2, '0');
      folders.push(`${year}-${month}-${day}T${hour}:00:00`);
      current.setHours(current.getHours() + 1); // Move to the next hour
    }

    return folders;
  }

  private filterObjectsByDate(objects: _Object[], startDate: number, endDate: number): _Object[] {
    let left = 0;
    let right = objects.length - 1;

    // 🔹 Binary Search to find the first object within range
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const midDate = Number(objects[mid].Key.split("/")[2].split(".json")[0]);

      if (midDate < startDate) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // 🔹 Collect results with early exit
    const result: _Object[] = [];
    for (let i = left; i < objects.length; i++) {
      const obj = objects[i];
      const objDate = Number(obj.Key.split("/")[2].split(".json")[0]);

      if (objDate > endDate) break; // ✅ Early exit
      if (obj.Key) result.push(obj);
    }

    return result;
  }

  private getBucketName(accUnit: string): string {
    const buckets: Record<string, string> = {
      second: this.config.get('NAME_BUCKET_SECOND_OPTION'),
      minute: this.config.get('NAME_BUCKET_MINUTE'),
      hour: this.config.get('NAME_BUCKET_HOUR')
    };
    const bucket = buckets[accUnit];
    return bucket;
  }

  private async paginateFolders(settings: InfoSettingsDto): Promise<ProcessedResult> {
    const { accUnit: step, initTime, endTime, lastID, length } = settings.filters;
    const folders = this.generateFolders((!lastID)?initTime:lastID, endTime);
    const bucket = this.getBucketName(step);
    const prefix = this.config.get('PREFIX_BUCKET');
    const pimmStates: PIMMState[] = [];
    let objectsCount = 0;
    let nextIndex = 0;
    let continuationToken: string | undefined;

    let startAfter: string | undefined = lastID
      ? `${(lastID)}.json`
      : undefined;

    while (objectsCount < length && nextIndex < folders.length) {
      const folder = folders[nextIndex];

      const { Contents = [], ContinuationToken, IsTruncated } = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: `${prefix}${folder}/`,
          StartAfter: `${prefix}${folder}/${startAfter}`,
          ContinuationToken: continuationToken,
        })
      );

      continuationToken = ContinuationToken;
      startAfter = undefined; // Reset startAfter since it applies only to the first request

      if (Contents.length === 0) {
        nextIndex++;
        continue;
      }

      const filteredObjects = this.filterObjectsByDate(Contents, initTime, endTime);

      // Process objects in parallel if order is not required
      const processedStates = await Promise.all(
        filteredObjects.slice(0, length - objectsCount).map(async obj => {
          const pimmState = await this.processS3Object(bucket, obj.Key);
          startAfter = obj.Key; // Update lastID only if an object is processed
          return pimmState;
        })
      );

      pimmStates.push(...processedStates);
      objectsCount += processedStates.length;

      if (!IsTruncated) {
        nextIndex++;
      }
    }

    return {
      pimmStates,
      lastID: startAfter ? Number(startAfter.split("/")[2].split(".json")[0]) : null,
      hasMore: !!continuationToken,
      totalProcessed: objectsCount,
    };
  }
  
  private async processS3Object(Bucket: string, Key: string): Promise<any> {
    const { Body, ContentEncoding } = await this.s3.send(
      new GetObjectCommand({ Bucket, Key })
    );

    const stream = Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) chunks.push(chunk);
    let buffer = Buffer.concat(chunks);

    if (ContentEncoding === 'gzip') {
      buffer = zlib.gunzipSync(buffer);
    }

    return JSON.parse(buffer.toString('utf-8'));

  }

}