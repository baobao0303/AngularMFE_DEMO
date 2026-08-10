import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { registerRemotes } from '@module-federation/enhanced/runtime';
import {
  DEFAULT_MFE_REMOTES,
  MfeRemoteEndpoints,
  getModuleFederationRemotes,
} from './remote-endpoints.config';

@Injectable({
  providedIn: 'root',
})
export class MfeManifestService {
  private readonly http = inject(HttpClient);
  private currentRemotes: MfeRemoteEndpoints = DEFAULT_MFE_REMOTES;

  /**
   * Fetch dynamic MFE remote configuration manifest from Backend API.
   * Dynamically registers remotes into Module Federation Runtime at application startup.
   */
  public async loadRemoteManifest(
    apiUrl = '/api/config/remotes'
  ): Promise<MfeRemoteEndpoints> {
    console.log(`[MfeManifestService] 🌐 Fetching dynamic MFE remote manifest from ${apiUrl}...`);

    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; data: MfeRemoteEndpoints }>(apiUrl).pipe(
          catchError((err) => {
            console.warn(`[MfeManifestService] ⚠️ Failed to fetch remote manifest from ${apiUrl}, falling back to DEFAULT_MFE_REMOTES:`, err);
            return of({ success: false, data: DEFAULT_MFE_REMOTES });
          })
        )
      );

      if (response && response.success && response.data) {
        this.currentRemotes = response.data;
        console.log(`[MfeManifestService] ✅ Successfully retrieved dynamic remote manifest from Backend:`, this.currentRemotes);
      } else {
        this.currentRemotes = DEFAULT_MFE_REMOTES;
      }

      // Register fetched remotes dynamically in Module Federation Runtime
      const remotesToRegister = getModuleFederationRemotes(this.currentRemotes, 'app-shell');
      if (remotesToRegister && remotesToRegister.length > 0) {
        registerRemotes(remotesToRegister);
        console.log(`[MfeManifestService] 🚀 Registered ${remotesToRegister.length} remotes dynamically in Module Federation Runtime.`);
      }
    } catch (error) {
      console.warn(`[MfeManifestService] ⚠️ Error loading remote manifest, using DEFAULT_MFE_REMOTES:`, error);
      this.currentRemotes = DEFAULT_MFE_REMOTES;
    }

    return this.currentRemotes;
  }

  public getRemotes(): MfeRemoteEndpoints {
    return this.currentRemotes;
  }
}
