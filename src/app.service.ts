import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  private readonly spotifyTokenUrl = 'https://accounts.spotify.com/api/token';
  private readonly logger = new Logger(AppService.name);

  // Variables pour mettre le token en cache
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  async getAccessToken(): Promise<string> {
    // Si le token est encore valide (avec une marge de 60s), on le réutilise
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Les identifiants Spotify ne sont pas configurés dans le .env');
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      // URLSearchParams remplace avantageusement la bibliothèque obsolète querystring
      const params = new URLSearchParams({ grant_type: 'client_credentials' });

      const response = await axios.post(
        this.spotifyTokenUrl,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      // expires_in est en secondes (ex: 3600) -> conversion en millisecondes + date actuelle
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

      return this.accessToken;
    } catch (error: any) {
      this.logger.error(
        'Erreur lors de la récupération du token Spotify',
        error.response?.data || error.message,
      );
      throw new Error('Impossible d\'obtenir le token d\'accès Spotify');
    }
  }

  // Exemple d'utilisation du token pour chercher sur Spotify
  async searchTracks(query: string) {
    const token = await this.getAccessToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: 'track', limit: 10 },
    });

    return response.data;
  }
}