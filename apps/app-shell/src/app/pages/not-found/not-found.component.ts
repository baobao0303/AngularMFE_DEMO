import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TDSIllustrationModule } from 'tds-ui/illustration';
import { TDSButtonModule } from 'tds-ui/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, TDSIllustrationModule, TDSButtonModule],
  template: `
    <div class="min-h-[85vh] w-full flex flex-col items-center justify-center p-6 bg-slate-50/30">
      <div class="max-w-md w-full flex flex-col items-center text-center">
        
        <!-- Illustration Container -->
        <div class="w-full max-w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex items-center justify-center">
          <div class="w-full">
            <tds-illustration tdsName="wi-empty-author" class="w-full h-64 flex items-center justify-center"></tds-illustration>
          </div>
        </div>

        <!-- 404 Status Code -->
        <h1 class="text-4xl font-extrabold text-[#800a20] tracking-tight mb-2">
          404
        </h1>

        <!-- Title -->
        <h2 class="text-xl font-bold text-slate-800 mb-2">
          Page Not Found
        </h2>

        <!-- Description -->
        <p class="text-xs md:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          Oops! The page you are looking for doesn't exist. It might have been moved, deleted, or perhaps the URL is incorrect.
        </p>

        <!-- Buttons Row (Flex Col for Centering) -->
        <div class="flex flex-col items-center justify-center gap-3 mb-8 w-full max-w-xs">
          <a routerLink="/dashboard" tds-button class="w-full !bg-[#800a20] !text-white !border-[#800a20] hover:!bg-[#a00d28] !h-10 !px-5 !rounded-xl font-semibold text-xs shadow-md inline-flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Back to Dashboard
          </a>

          <a routerLink="/dashboard" tds-button class="w-full !bg-white !text-slate-700 !border-slate-200 hover:!bg-slate-50 !h-10 !px-5 !rounded-xl font-medium text-xs shadow-sm inline-flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Contact Support
          </a>
        </div>

        <!-- Footer Links (No full border-t divider line) -->
        <div class="flex items-center gap-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest w-full justify-center">
          <a routerLink="/dashboard" class="hover:text-slate-600 transition-colors">STATUS</a>
          <span>•</span>
          <a routerLink="/dashboard" class="hover:text-slate-600 transition-colors">DOCUMENTATION</a>
          <span>•</span>
          <a routerLink="/dashboard" class="hover:text-slate-600 transition-colors">HOME</a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class NotFoundComponent {}
