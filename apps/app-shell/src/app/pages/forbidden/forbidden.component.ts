import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TDSIllustrationModule } from 'tds-ui/illustration';
import { TDSButtonModule } from 'tds-ui/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink, TDSIllustrationModule, TDSButtonModule],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div class="max-w-md w-full flex flex-col items-center">
        
        <!-- Thought Cloud Bubble with Status 403 -->
        <div class="relative mb-4 flex flex-col items-center group">
          <!-- Thought Cloud Box -->
          <div class="relative bg-gradient-to-r from-[#800a20] to-[#a00d28] text-white px-7 py-3 rounded-[2rem] shadow-xl border-2 border-white/80 flex items-center gap-3 transform transition-all duration-300 group-hover:scale-105">
            <span class="w-3 h-3 rounded-full bg-amber-300 animate-ping"></span>
            <span class="text-xl font-extrabold tracking-wider">403</span>
            <span class="text-xs font-semibold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">Truy cập bị từ chối</span>
          </div>

          <!-- Thought Cloud Tail Circles -->
          <div class="flex flex-col items-center -space-y-0.5 mt-1">
            <div class="w-4 h-4 bg-[#800a20] rounded-full border border-white/60 shadow-sm"></div>
            <div class="w-2.5 h-2.5 bg-[#800a20] rounded-full border border-white/40 shadow-sm"></div>
            <div class="w-1.5 h-1.5 bg-[#800a20] rounded-full border border-white/20"></div>
          </div>
        </div>

        <!-- TDS Illustration -->
        <div class="w-64 h-64 md:w-72 md:h-72 my-2 flex items-center justify-center">
          <tds-illustration tdsName="403"></tds-illustration>
        </div>

        <!-- Page Text & Actions -->
        <h1 class="text-2xl md:text-3xl font-bold text-[#131B2E] mt-4 mb-2">
          Không có quyền truy cập
        </h1>
        <p class="text-sm md:text-base text-gray-500 mb-8 max-w-sm">
          Bạn không có quyền xem nội dung này. Vui lòng liên hệ với Quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.
        </p>

        <a routerLink="/dashboard" tds-button tdsType="primary" class="!bg-[#800a20] !border-[#800a20] hover:!bg-[#a00d28] !h-11 !px-8 !rounded-xl font-semibold shadow-md flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Quay lại Trang chủ
        </a>

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
export class ForbiddenComponent {}
