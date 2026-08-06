import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mfe-dashboard-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Tab Skeleton bar -->
      <div class="flex gap-8 border-b border-slate-200 pb-3">
        <div class="h-6 w-24 bg-slate-200 rounded-md animate-pulse"></div>
        <div class="h-6 w-28 bg-slate-200/60 rounded-md animate-pulse"></div>
        <div class="h-6 w-20 bg-slate-200/60 rounded-md animate-pulse"></div>
      </div>

      <!-- KPI Cards Grid (4 Cards Skeleton matching exact card height) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div *ngFor="let i of [1,2,3,4]" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[120px]">
          <div class="flex justify-between items-start">
            <div class="space-y-2">
              <div class="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
              <div class="h-7 w-28 bg-slate-300 rounded-md animate-pulse"></div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-slate-100 animate-pulse"></div>
          </div>
          <div class="h-4 w-24 bg-emerald-100/70 rounded-md animate-pulse"></div>
        </div>
      </div>

      <!-- Revenue Growth Chart Skeleton matching exact h-64 chart viewport height -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div class="flex justify-between items-center">
          <div class="space-y-2">
            <div class="h-5 w-40 bg-slate-200 rounded animate-pulse"></div>
            <div class="h-3 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div class="h-8 w-32 bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
        <div class="h-64 w-full bg-slate-50/80 rounded-xl border border-slate-100 p-4 flex flex-col justify-between">
          <div class="space-y-6">
            <div class="h-[1px] w-full bg-slate-200/70 border-t border-dashed"></div>
            <div class="h-[1px] w-full bg-slate-200/70 border-t border-dashed"></div>
            <div class="h-[1px] w-full bg-slate-200/70 border-t border-dashed"></div>
          </div>
          <div class="flex justify-between px-2 pt-2 border-t border-slate-100">
            <div class="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
            <div class="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
            <div class="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
            <div class="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Bottom 2-Column Skeleton Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-1 h-64">
          <div class="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div class="space-y-3">
            <div class="flex gap-3"><div class="w-8 h-8 rounded-full bg-slate-100"></div><div class="space-y-1.5 flex-1"><div class="h-3 w-3/4 bg-slate-200 rounded"></div><div class="h-2.5 w-1/2 bg-slate-100 rounded"></div></div></div>
            <div class="flex gap-3"><div class="w-8 h-8 rounded-full bg-slate-100"></div><div class="space-y-1.5 flex-1"><div class="h-3 w-3/4 bg-slate-200 rounded"></div><div class="h-2.5 w-1/2 bg-slate-100 rounded"></div></div></div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2 h-64">
          <div class="flex justify-between"><div class="h-5 w-48 bg-slate-200 rounded animate-pulse"></div><div class="h-4 w-20 bg-slate-100 rounded animate-pulse"></div></div>
          <div class="space-y-3 pt-2">
            <div class="h-8 w-full bg-slate-100 rounded"></div>
            <div class="h-10 w-full bg-slate-50 rounded"></div>
            <div class="h-10 w-full bg-slate-50 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardSkeletonComponent {}
