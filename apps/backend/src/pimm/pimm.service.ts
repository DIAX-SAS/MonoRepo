import { Injectable } from '@nestjs/common';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import * as zlib from 'zlib';
import { Readable } from 'stream';

@Injectable()
export class PlcService {
  private s3 = new S3Client({ region: 'us-east-1' });
  async GetObjects(settings) {
      let BucketTarget = '';
      const pimmStates = [];
  
      const filters = settings.filters;
      switch (filters.accUnit) {
        case "second":
          BucketTarget = 'pimmbucket';
          break;
        case "minute":
          BucketTarget = 'pimmminutebucket';
          break;
        case "hour":
          BucketTarget = 'pimmhourbucket';
          break;
        default:
          throw new Error('Invalid accUnit');
      }
  
      // Convert dates to ISO strings for comparison
      const startDate = new Date(filters.startDate).toISOString();
      const endDate = new Date(filters.endDate).toISOString();
  
      // List objects in the bucket with a specific prefix
      const listParams = {
        Bucket: BucketTarget,
      };
  
      const listedObjects = await this.s3.send(new ListObjectsV2Command(listParams));
  
      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        return { pimmStates: [] };
      }
  
      // Filter objects based on the date range
      const filteredObjects = listedObjects.Contents.filter((obj) => {
        const lastModified = obj.LastModified?.toISOString();
        return lastModified && lastModified >= startDate && lastModified <= endDate;
      });
  
      for (const obj of filteredObjects) {
        const getObjectParams = {
          Bucket: BucketTarget,
          Key: obj.Key,
        };
  
        const s3Object = await this.s3.send(new GetObjectCommand(getObjectParams));
  
        // Check if the object is compressed (gzip)
        const contentEncoding = s3Object.ContentEncoding;  // Get the encoding
        const bodyStream = s3Object.Body as Readable;
        let buffer: Buffer;
  
        if (contentEncoding === 'gzip') {
          // If gzip-compressed, decompress the content
          const chunks: Buffer[] = [];
          for await (const chunk of bodyStream) {
            chunks.push(chunk);
          }
  
          buffer = Buffer.concat(chunks);
          buffer = zlib.gunzipSync(buffer); // Decompress the data
        } else {
          // If not compressed, use the data directly
          const chunks: Buffer[] = [];
          for await (const chunk of bodyStream) {
            chunks.push(chunk);
          }
          buffer = Buffer.concat(chunks);
        }
  
        // Parse the decompressed JSON data
        const data = JSON.parse(buffer.toString('utf-8'));
        pimmStates.push(data);
      }
  
      if (pimmStates.length === 0) {
        return { pimmStates: [] };
      }
  
      return {
        pimmStates: pimmStates,
      };
  }
  
}
