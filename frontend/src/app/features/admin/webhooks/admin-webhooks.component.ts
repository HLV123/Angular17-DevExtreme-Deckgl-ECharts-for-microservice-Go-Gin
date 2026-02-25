import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular';
import { WebhookService, Webhook } from '../../../core/services/webhook.service';
import { ExportService } from '../../../core/services/export.service';
import notify from 'devextreme/ui/notify';

@Component({
    selector: 'app-admin-webhooks', standalone: true,
    imports: [CommonModule, FormsModule, DxDataGridModule],
    template: `
    <div class="page animate-fade-in">
      <div class="pg-hdr">
        <div><h1><i class="fas fa-satellite-dish"></i> Quản lý Webhook</h1>
        <p>{{webhooks.length}} webhook endpoints · Delivery tracking</p></div>
        <div class="hdr-acts">
          <button class="btn-sec" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
          <button class="btn-sec" (click)="exportPdf()"><i class="fas fa-file-pdf"></i> PDF</button>
          <button class="btn-primary" (click)="openCreate()"><i class="fas fa-plus"></i> Tạo Webhook</button>
        </div>
      </div>
      <div class="kpi-row">
        <div class="kc"><div class="ki bg-blue"><i class="fas fa-satellite-dish"></i></div><div><b>{{webhooks.length}}</b><span>Tổng</span></div></div>
        <div class="kc"><div class="ki bg-green"><i class="fas fa-check"></i></div><div><b>{{activeCount}}</b><span>Active</span></div></div>
        <div class="kc"><div class="ki bg-purple"><i class="fas fa-paper-plane"></i></div><div><b>{{totalDeliveries | number}}</b><span>Deliveries</span></div></div>
        <div class="kc"><div class="ki bg-red"><i class="fas fa-times"></i></div><div><b>{{totalFailures}}</b><span>Failures</span></div></div>
      </div>
      <div class="card">
        <dx-data-grid [dataSource]="webhooks" [showBorders]="false" [columnAutoWidth]="true" [rowAlternationEnabled]="true" [hoverStateEnabled]="true" class="custom-grid">
          <dxo-search-panel [visible]="true" width="280" placeholder="Tìm kiếm..."></dxo-search-panel>
          <dxo-paging [pageSize]="10"></dxo-paging>
          <dxi-column dataField="url" caption="URL" cellTemplate="urlTpl" minWidth="280"></dxi-column>
          <dxi-column dataField="isActive" caption="Status" cellTemplate="stTpl" width="100" alignment="center"></dxi-column>
          <dxi-column dataField="events" caption="Events" cellTemplate="evTpl" width="220"></dxi-column>
          <dxi-column dataField="deliveryCount" caption="Deliveries" width="100" alignment="center"></dxi-column>
          <dxi-column dataField="failureCount" caption="Failures" cellTemplate="failTpl" width="90" alignment="center"></dxi-column>
          <dxi-column dataField="lastDelivery" caption="Last" width="120"></dxi-column>
          <dxi-column caption="" cellTemplate="actTpl" width="160" alignment="center"></dxi-column>
          <div *dxTemplate="let c of 'urlTpl'"><code style="font-family:'JetBrains Mono';font-size:11px;color:#22c55e">{{c.value}}</code></div>
          <div *dxTemplate="let c of 'stTpl'"><span class="st" [ngClass]="c.value?'on':'off'">{{c.value?'Active':'Off'}}</span></div>
          <div *dxTemplate="let c of 'evTpl'"><span *ngFor="let e of c.value" class="ev-tag">{{e}}</span></div>
          <div *dxTemplate="let c of 'failTpl'"><span [style.color]="c.value>0?'#ef4444':'#64748b'" [style.fontWeight]="c.value>0?'700':'400'">{{c.value}}</span></div>
          <div *dxTemplate="let c of 'actTpl'">
            <button class="abtn" (click)="testWebhook(c.data)" title="Test"><i class="fas fa-paper-plane"></i></button>
            <button class="abtn" (click)="c.data.isActive=!c.data.isActive;calcStats()" title="Toggle"><i class="fas" [ngClass]="c.data.isActive?'fa-pause':'fa-play'"></i></button>
            <button class="abtn" (click)="viewHistory(c.data)" title="History"><i class="fas fa-history"></i></button>
            <button class="abtn danger" (click)="deleteWh(c.data)" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </dx-data-grid>
      </div>
      <div *ngIf="testResult" class="test-banner" [ngClass]="testResult.success?'ok':'fail'" (click)="testResult=null">
        <i class="fas" [ngClass]="testResult.success?'fa-check-circle':'fa-times-circle'"></i>
        Test {{testUrl}}: HTTP {{testResult.statusCode}} · {{testResult.responseTime}}ms
        <small style="margin-left:auto;opacity:.6">Click đóng</small>
      </div>
      <!-- History Modal -->
      <div class="modal-bg" *ngIf="showHistory" (click)="showHistory=false">
        <div class="modal" (click)="$event.stopPropagation()" style="width:650px">
          <div class="mhdr"><h2><i class="fas fa-history"></i> Delivery History</h2><button (click)="showHistory=false"><i class="fas fa-times"></i></button></div>
          <div class="mbody">
            <div *ngFor="let d of history" class="del-row" [ngClass]="d.ok?'ok':'fail'">
              <div class="del-icon"><i class="fas" [ngClass]="d.ok?'fa-check':'fa-times'"></i></div>
              <span class="ev-tag">{{d.event}}</span>
              <code class="del-ts">{{d.ts}}</code>
              <span class="del-code">HTTP {{d.code}}</span>
              <span class="del-ms">{{d.ms}}ms</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Create Modal -->
      <div class="modal-bg" *ngIf="showCreate" (click)="showCreate=false">
        <div class="modal" (click)="$event.stopPropagation()" style="width:480px">
          <div class="mhdr"><h2><i class="fas fa-plus"></i> Tạo Webhook</h2><button (click)="showCreate=false"><i class="fas fa-times"></i></button></div>
          <div class="mbody">
            <div class="fg"><label>URL</label><input [(ngModel)]="nw.url" placeholder="https://..." /></div>
            <div class="fg"><label>Events</label>
              <div class="ev-checks"><label *ngFor="let e of allEv" class="ev-chk"><input type="checkbox" [checked]="nw.events.includes(e)" (change)="togEv(e)"/> {{e}}</label></div>
            </div>
            <div class="fg"><label>Secret</label><input [(ngModel)]="nw.secret" placeholder="whsec_..." /></div>
          </div>
          <div class="mftr"><button class="btn-outline" (click)="showCreate=false">Hủy</button><button class="btn-primary" (click)="createWh()">Tạo</button></div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#a78bfa}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:8px}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px}
    .btn-sec{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:10px 16px;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px}
    .btn-outline{background:rgba(30,41,59,.8);border:1px solid #334155;color:#94a3b8;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px}
    .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.kc{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:14px}.ki{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px}
    .bg-blue{background:rgba(56,189,248,.1);color:#38bdf8}.bg-green{background:rgba(34,197,94,.1);color:#22c55e}.bg-purple{background:rgba(139,92,246,.1);color:#a78bfa}.bg-red{background:rgba(239,68,68,.1);color:#ef4444}
    .kc b{font-family:'Outfit';font-size:24px;font-weight:700;color:#f1f5f9;display:block;line-height:1}.kc span{font-size:11px;color:#64748b}
    .card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;overflow:hidden;padding:10px}
    ::ng-deep .custom-grid .dx-datagrid{color:#cbd5e1;font-family:'DM Sans';background:transparent}::ng-deep .custom-grid .dx-datagrid-headers{background:rgba(15,23,42,.5);color:#64748b}::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row{border-bottom:1px solid rgba(51,65,85,.3)}::ng-deep .custom-grid .dx-texteditor-input{color:#e2e8f0!important}
    .st{padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700}.st.on{background:rgba(34,197,94,.1);color:#22c55e}.st.off{background:rgba(100,116,139,.1);color:#64748b}
    .ev-tag{background:rgba(139,92,246,.1);color:#a78bfa;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;margin-right:4px}
    .abtn{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.15);color:#38bdf8;width:30px;height:30px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:11px;margin:0 2px}.abtn.danger{color:#ef4444;border-color:rgba(239,68,68,.2)}
    .test-banner{display:flex;align-items:center;gap:12px;padding:14px 20px;border-radius:12px;margin-top:16px;cursor:pointer;font-size:13px;font-weight:600}.test-banner.ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e}.test-banner.fail{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;display:flex;align-items:center;justify-content:center}.modal{background:#0f172a;border:1px solid #334155;border-radius:16px;max-height:80vh;overflow-y:auto}
    .mhdr{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-bottom:1px solid #334155}.mhdr h2{font-family:'Outfit';font-size:17px;color:#f1f5f9;display:flex;align-items:center;gap:8px}.mhdr h2 i{color:#38bdf8}.mhdr button{background:none;border:none;color:#64748b;cursor:pointer;font-size:16px}
    .mbody{padding:22px}.mftr{display:flex;justify-content:flex-end;gap:8px;padding:14px 22px;border-top:1px solid #334155}
    .fg{margin-bottom:14px}.fg label{display:block;font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:5px}.fg input{width:100%;background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:9px;font-size:13px;outline:none;box-sizing:border-box}
    .ev-checks{display:flex;flex-wrap:wrap;gap:6px}.ev-chk{display:flex;align-items:center;gap:4px;font-size:12px;color:#cbd5e1;background:rgba(15,23,42,.4);padding:4px 10px;border-radius:6px;cursor:pointer}
    .del-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;margin-bottom:4px;border:1px solid rgba(51,65,85,.3)}.del-row.ok{border-left:3px solid #22c55e}.del-row.fail{border-left:3px solid #ef4444}
    .del-icon{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px}.del-row.ok .del-icon{background:rgba(34,197,94,.1);color:#22c55e}.del-row.fail .del-icon{background:rgba(239,68,68,.1);color:#ef4444}
    .del-ts{font-family:'JetBrains Mono';font-size:10px;color:#64748b;flex:1}.del-code{font-size:11px;font-weight:600;color:#e2e8f0}.del-ms{font-size:10px;color:#64748b}
  `]
})
export class AdminWebhooksComponent implements OnInit {
    webhooks: any[] = []; activeCount = 0; totalDeliveries = 0; totalFailures = 0;
    showCreate = false; showHistory = false; testResult: any = null; testUrl = '';
    history: any[] = [];
    allEv = ['alert.new', 'alert.closed', 'data.hourly', 'report.ready', 'station.offline', 'aqi.critical'];
    nw = { url: '', events: [] as string[], secret: '' };

    constructor(private whSvc: WebhookService, private exportSvc: ExportService) { }
    ngOnInit() { this.whSvc.getWebhooks().subscribe(w => { this.webhooks = w; this.calcStats(); }); }
    calcStats() { this.activeCount = this.webhooks.filter(w => w.isActive).length; this.totalDeliveries = this.webhooks.reduce((s, w) => s + w.deliveryCount, 0); this.totalFailures = this.webhooks.reduce((s, w) => s + w.failureCount, 0); }
    testWebhook(w: any) { this.testUrl = w.url; this.whSvc.testWebhook(w.id).subscribe(r => { this.testResult = r; notify({ message: r.success ? 'OK!' : 'Failed!', type: r.success ? 'success' : 'error', displayTime: 2500 }); }); }
    deleteWh(w: any) { this.webhooks = this.webhooks.filter(x => x.id !== w.id); this.calcStats(); notify({ message: 'Đã xoá', type: 'warning', displayTime: 2000 }); }
    viewHistory(w: any) {
        this.history = Array.from({ length: 15 }, (_, i) => ({ event: w.events[i % w.events.length], ts: new Date(Date.now() - i * 3600000 * Math.random() * 5).toISOString().replace('T', ' ').substring(0, 19), ok: Math.random() > .15, code: Math.random() > .15 ? 200 : [400, 500, 503][Math.floor(Math.random() * 3)], ms: Math.round(50 + Math.random() * 500) }));
        this.showHistory = true;
    }
    togEv(e: string) { const i = this.nw.events.indexOf(e); if (i >= 0) this.nw.events.splice(i, 1); else this.nw.events.push(e); }
    openCreate() { this.nw = { url: '', events: [], secret: '' }; this.showCreate = true; }
    createWh() {
        if (!this.nw.url) { notify({ message: 'Nhập URL', type: 'warning', displayTime: 2000 }); return; }
        this.webhooks.push({ id: 'WH' + String(this.webhooks.length + 1).padStart(3, '0'), url: this.nw.url, events: this.nw.events, isActive: true, secret: this.nw.secret || 'whsec_' + Math.random().toString(36).substr(2, 12), createdAt: new Date().toISOString().substring(0, 10), deliveryCount: 0, failureCount: 0 });
        this.calcStats(); this.showCreate = false; notify({ message: 'Tạo thành công!', type: 'success', displayTime: 2000 });
    }
    exportExcel() { this.exportSvc.exportExcel(this.webhooks, [{ header: 'ID', key: 'id', width: 10 }, { header: 'URL', key: 'url', width: 40 }, { header: 'Active', key: 'isActive', width: 10 }, { header: 'Deliveries', key: 'deliveryCount', width: 12 }, { header: 'Failures', key: 'failureCount', width: 12 }], 'webhooks'); }
    exportPdf() { const rows = this.webhooks.map(w => `<tr><td>${w.id}</td><td>${w.url}</td><td>${w.isActive ? 'Active' : 'Off'}</td><td>${w.deliveryCount}</td><td>${w.failureCount}</td></tr>`).join(''); this.exportSvc.exportPdf('Webhooks', `<table><thead><tr><th>ID</th><th>URL</th><th>Status</th><th>Deliveries</th><th>Failures</th></tr></thead><tbody>${rows}</tbody></table>`); }
}
