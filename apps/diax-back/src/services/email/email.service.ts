import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private sesClient: SESClient;
  private senderEmail: string;
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly config: ConfigService) {
    const isDev = process.env.NODE_ENV === 'development';
    this.sesClient = new SESClient({
      region: this.config.get<string>('AWS_REGION'),
      endpoint: this.config.get<string>('SES_URI'), 
      ...(isDev && {
        credentials: {
          accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
        },
      }),
    });

    this.senderEmail = this.config.get<string>('SENDER_EMAIL'); // e.g., verified sender in SES
  }

  async sendEmail(address: string, content: string, subject: string) {
    const params: SendEmailCommandInput = {
      Source: this.senderEmail,
      Destination: {
        ToAddresses: [address],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: content,
          },
        },
      },
    };

    try {
      await this.sesClient.send(new SendEmailCommand(params));
      return { status: 200, description: 'Successfully sent report.' };
    } catch (error: unknown) {
      const errorCode = error instanceof Error ? error.name : 'UnknownError';
      const errorMessage =
        error instanceof Error ? error.message : 'No error message provided';
      const requestId =
        (error as { $metadata?: { requestId?: string } })?.$metadata
          ?.requestId || 'No request ID';

      this.logger.error(`SES sendEmail failed`, {
        code: errorCode,
        message: errorMessage,
        requestId,
      });

      throw new InternalServerErrorException(
        `SES error (${errorCode}): ${errorMessage}`
      );
    }
  }
}
