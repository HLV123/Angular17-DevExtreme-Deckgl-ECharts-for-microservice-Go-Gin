import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLog } from '../../../core/models';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-admin-audit-log', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-clipboard-list"></i> Nhật ký Hệ thống (Audit Log)</h1>
    <p>{{logs.length}} bản ghi · Lưu trữ 90 ngày</p></div>
    <div class="hdr-acts"><button class="btn-export" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Export</button></div></div>

    <div class="filter-bar">
      <select [(ngModel)]="fAction" (change)="filter()" class="sel"><option value="">Tất cả hành động</option>
        <option *ngFor="let a of actionTypes" [value]="a">{{a}}</option></select>
      <select [(ngModel)]="fUser" (change)="filter()" class="sel"><option value="">Tất cả người dùng</option>
        <option *ngFor="let u of userNames" [value]="u">{{u}}</option></select>
      <input [(ngModel)]="fSearch" (input)="filter()" class="sel" placeholder="Tìm resource..." style="flex:1"/>
    </div>

    <div class="log-table">
      <table><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Resource</th><th>Chi tiết</th><th>IP</th></tr></thead>
        <tbody><tr *ngFor="let l of filtered">
          <td class="td-time">{{formatTime(l.timestamp)}}</td>
          <td><span class="user-chip">{{l.userName}}</span></td>
          <td><span class="action-badge" [ngClass]="actionClass(l.action)">{{l.action}}</span></td>
          <td class="td-resource">{{l.resource}}</td>
          <td class="td-detail">{{l.details}}</td>
          <td class="td-ip">{{l.ipAddress}}</td>
        </tr></tbody></table>
    </div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#a78bfa}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:8px}.btn-export{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
    .filter-bar{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}.sel{background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:10px;font-size:12px;min-width:150px}
    .log-table{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;overflow:hidden}
    table{width:100%;border-collapse:collapse}thead th{background:rgba(15,23,42,.6);color:#94a3b8;padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;position:sticky;top:0}
    tbody td{padding:10px 12px;color:#cbd5e1;border-bottom:1px solid rgba(51,65,85,.2);font-size:12px}
    tbody tr:hover{background:rgba(56,189,248,.03)}
    .td-time{color:#64748b;font-family:'JetBrains Mono',monospace;font-size:11px;white-space:nowrap}.td-resource{color:#38bdf8;font-weight:600}.td-detail{color:#94a3b8;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-ip{color:#64748b;font-family:'JetBrains Mono',monospace;font-size:10px}
    .user-chip{background:rgba(56,189,248,.1);color:#38bdf8;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600}
    .action-badge{padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;text-transform:uppercase}.action-badge.login{background:rgba(34,197,94,.1);color:#22c55e}.action-badge.create{background:rgba(56,189,248,.1);color:#38bdf8}.action-badge.update{background:rgba(234,179,8,.1);color:#eab308}.action-badge.delete{background:rgba(239,68,68,.1);color:#ef4444}.action-badge.export{background:rgba(139,92,246,.1);color:#a78bfa}.action-badge.other{background:rgba(100,116,139,.1);color:#94a3b8}`]
})
export class AdminAuditLogComponent implements OnInit {
  logs: AuditLog[] = []; filtered: AuditLog[] = [];
  fAction = ''; fUser = ''; fSearch = '';
  actionTypes: string[] = []; userNames: string[] = [];
  constructor(private auditSvc: AuditService, private exportSvc: ExportService) {}

  ngOnInit() {
    this.auditSvc.getAuditLogs().subscribe(logs => {
      this.logs = logs; this.filtered = logs;
      this.actionTypes = [...new Set(logs.map(l => l.action))].sort();
      this.userNames = [...new Set(logs.map(l => l.userName))].sort();
    });
  }

  filter() {
    let r = [...this.logs];
    if (this.fAction) r = r.filter(l => l.action === this.fAction);
    if (this.fUser) r = r.filter(l => l.userName === this.fUser);
    if (this.fSearch) { const q = this.fSearch.toLowerCase(); r = r.filter(l => l.resource.toLowerCase().includes(q)); }
    this.filtered = r;
  }

  formatTime(ts: string) { return new Date(ts).toLocaleString('vi-VN'); }
  actionClass(a: string) { return a.startsWith('LOGIN') ? 'login' : a.startsWith('CREATE') ? 'create' : a.startsWith('UPDATE') || a.startsWith('ACKNOWLEDGE') ? 'update' : a.startsWith('DELETE') ? 'delete' : a.startsWith('EXPORT') || a.startsWith('IMPORT') ? 'export' : 'other'; }
  exportExcel() {
    this.exportSvc.exportExcel(this.filtered, [
      { header: 'Thời gian', key: 'timestamp', width: 20 }, { header: 'Người dùng', key: 'userName', width: 22 },
      { header: 'Hành động', key: 'action', width: 18 }, { header: 'Resource', key: 'resource', width: 20 },
      { header: 'IP', key: 'ipAddress', width: 16 }
    ], 'audit-log');
  }
}
