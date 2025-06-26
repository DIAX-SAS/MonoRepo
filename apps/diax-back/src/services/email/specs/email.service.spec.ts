import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { InternalServerErrorException } from '@nestjs/common';

// Mock SESClient and send method
jest.mock('@aws-sdk/client-ses', () => {
  const original = jest.requireActual('@aws-sdk/client-ses');
  return {
    ...original,
    SESClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    SendEmailCommand: jest.fn(),
  };
});

describe('EmailService', () => {
  let service: EmailService;
  let mockSesClient: any;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'AWS_REGION':
          return 'us-east-1';
        case 'AWS_ACCESS_KEY_ID':
          return 'test-access-key';
        case 'AWS_SECRET_ACCESS_KEY':
          return 'test-secret-key';
        case 'SENDER_EMAIL':
          return 'no-reply@example.com';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Get instance of mocked SESClient
    mockSesClient = (SESClient as jest.Mock).mock.results[0].value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send email successfully', async () => {
    // Arrange
    mockSesClient.send.mockResolvedValueOnce({});

    // Act
    const response = await service.sendEmail(
      'recipient@example.com',
      '<p>Hello</p>',
      'Test Subject'
    );

    // Assert
    expect(SendEmailCommand).toHaveBeenCalledTimes(1);
    expect(mockSesClient.send).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      status: 200,
      description: 'Successfully sent report.',
    });
  });

});
