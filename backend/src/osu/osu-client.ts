import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { API, APIError } from 'osu-api-v2-js';

/**
 * Shared osu! API client authenticated with the app's own credentials
 * (client-credentials grant), used for everything that is public data.
 */
@Injectable()
export class OsuClient {
  private readonly logger = new Logger(OsuClient.name);
  private api?: API;

  get(): API {
    if (!this.api) {
      const clientId = Number(process.env.OSU_CLIENT_ID);
      const clientSecret = process.env.OSU_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new ServiceUnavailableException({
          code: 'OSU_CREDENTIALS_MISSING',
          message:
            'osu! API credentials are not configured (OSU_CLIENT_ID and OSU_CLIENT_SECRET).',
        });
      }
      this.api = new API(clientId, clientSecret);
    }
    return this.api;
  }

  /** Maps an osu! API failure to an HTTP error, treating 404 as `notFound`. */
  toHttpException(
    error: unknown,
    notFound: { code: string; message: string },
  ): Error {
    if (error instanceof APIError && error.response?.status_code === 404) {
      return new NotFoundException(notFound);
    }
    this.logger.error(`osu! API request failed: ${String(error)}`);
    return new BadGatewayException({
      code: 'OSU_API_FAILED',
      message: 'Could not reach the osu! API.',
    });
  }
}
