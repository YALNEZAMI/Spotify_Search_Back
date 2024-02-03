import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as querystring from 'querystring';
@Injectable()
export class AppService {
  private readonly spotifyTokenUrl = 'https://accounts.spotify.com/api/token';

  async getAccessToken(): Promise<string> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    console.log('Getting access token', clientId, clientSecret);

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    };

    const data = {
      grant_type: 'client_credentials',
    };

    try {
      const response = await axios.post(
        this.spotifyTokenUrl,
        querystring.stringify(data),
        { headers },
      );
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      // Handle error
      console.error('Error getting access token:', error.response.data);
      throw new Error('Failed to get access token');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
