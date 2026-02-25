import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_API_KEYS } from '../../../core/mock-data/others.mock';
import { WebhookService, Webhook } from '../../../core/services/webhook.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-admin-api-keys', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in">
    <div class="pg-hdr"><div><h1><i class="fas fa-key"></i> API Keys & Webhooks</h1><p>{{keys.length}} API keys · {{webhooks.length}} webhooks</p></div>
      <div class="hdr-acts"><button class="btn-primary" (click)="showCreate=true"><i class="fas fa-plus"></i> Tạo API Key</button>
        <button class="btn-sec" (click)="exportKeys()"><i class="fas fa-file-excel"></i> Export</button></div></div>

    <h3 class="sec-title"><i class="fas fa-key"></i> API Keys</h3>
    <div class="keys-grid"><div *ngFor="let k of keys" class="key-card" [class.active]="k.isActive">
      <div class="key-top"><h4>{{k.organization}}</h4><span class="st" [ngClass]="k.isActive?'on':'off'">{{k.isActive?'Active':'Revoked'}}</span></div>
      <div class="key-val"><code>{{maskKey(k.key)}}</code><button class="icon-btn" (click)="copy(k.key)" title="Copy"><i class="fas fa-copy"></i></button></div>
      <div class="key-meta"><div class="km"><span class="kml">Scope</span><span class="kmv">{{k.scope}}</span></div><div class="km"><span class="kml">Rate</span><span class="kmv">{{k.rateLimit}}/h</span></div><div class="km"><span class="kml">Calls</span><span class="kmv">{{k.usageCount | number}}</span></div><div class="km"><span class="kml">Last Used</span><span class="kmv">{{k.lastUsedAt || 'Never'}}</span></div></div>
      <div class="key-bar"><div class="kb-fill" [style.width.%]="k.usageCount/k.rateLimit*100"></div></div>
      <div class="key-actions"><button class="abtn" (click)="k.isActive=!k.isActive"><i class="fas" [ngClass]="k.isActive?'fa-pause':'fa-play'"></i></button><button class="abtn danger"><i class="fas fa-trash"></i></button></div>
    </div></div>

    <h3 class="sec-title"><i class="fas fa-satellite-dish"></i> Webhooks</h3>
    <div class="wh-grid"><div *ngFor="let w of webhooks" class="wh-card" [class.active]="w.isActive">
      <div class="wh-top"><code>{{w.url}}</code><span class="st" [ngClass]="w.isActive?'on':'off'">{{w.isActive?'On':'Off'}}</span></div>
      <div class="wh-events"><span *ngFor="let e of w.events" class="ev-tag">{{e}}</span></div>
      <div class="wh-meta"><span>{{w.deliveryCount}} deliveries</span><span class="wh-fail" *ngIf="w.failureCount">{{w.failureCount}} failures</span><span>Last: {{w.lastDelivery}}</span></div>
      <div class="wh-actions"><button class="abtn" (click)="testWebhook(w)"><i class="fas fa-paper-plane"></i> Test</button><button class="abtn" (click)="w.isActive=!w.isActive"><i class="fas" [ngClass]="w.isActive?'fa-pause':'fa-play'"></i></button></div>
      <div class="test-result" *ngIf="w.testResult" [ngClass]="w.testResult.success?'ok':'fail'">
        {{w.testResult.success?'✓':'✗'}} HTTP {{w.testResult.statusCode}} · {{w.testResult.responseTime}}ms</div>
    </div></div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:8px}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px}.btn-sec{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px}
    .sec-title{font-family:'Outfit';font-size:16px;color:#e2e8f0;margin:20px 0 12px;display:flex;align-items:center;gap:8px}.sec-title i{color:#38bdf8;font-size:14px}
    .keys-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px}.key-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:16px;transition:all .2s}.key-card.active{border-left:3px solid #22c55e}.key-card:hover{border-color:rgba(56,189,248,.3)}
    .key-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.key-top h4{font-family:'Outfit';font-size:14px;color:#f1f5f9}.st{padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700}.st.on{background:rgba(34,197,94,.1);color:#22c55e}.st.off{background:rgba(100,116,139,.1);color:#64748b}
    .key-val{display:flex;align-items:center;gap:6px;background:rgba(15,23,42,.5);padding:8px 12px;border-radius:8px;margin-bottom:10px}.key-val code{font-family:'JetBrains Mono';font-size:11px;color:#22c55e;flex:1}.icon-btn{background:none;border:none;color:#64748b;cursor:pointer;font-size:13px}.icon-btn:hover{color:#38bdf8}
    .key-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}.km{background:rgba(15,23,42,.4);padding:6px 8px;border-radius:6px;text-align:center}.kml{display:block;font-size:8px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}.kmv{font-size:11px;color:#e2e8f0;font-weight:600}
    .key-bar{height:3px;background:rgba(51,65,85,.5);border-radius:2px;margin-bottom:8px;overflow:hidden}.kb-fill{height:100%;background:linear-gradient(90deg,#22c55e,#eab308);border-radius:2px}
    .key-actions{display:flex;gap:4px}.abtn{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.15);color:#38bdf8;width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px}.abtn.danger{color:#ef4444;border-color:rgba(239,68,68,.2)}
    .wh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:12px}.wh-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:16px}.wh-card.active{border-left:3px solid #a78bfa}
    .wh-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.wh-top code{font-family:'JetBrains Mono';font-size:11px;color:#22c55e}
    .wh-events{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}.ev-tag{background:rgba(139,92,246,.1);color:#a78bfa;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600}
    .wh-meta{display:flex;gap:12px;font-size:11px;color:#64748b;margin-bottom:8px}.wh-fail{color:#ef4444}
    .wh-actions{display:flex;gap:4px;margin-bottom:6px}.wh-actions .abtn{width:auto;padding:6px 12px;gap:4px;font-size:11px}
    .test-result{padding:6px 10px;border-radius:6px;font-size:11px;font-family:'JetBrains Mono'}.test-result.ok{background:rgba(34,197,94,.1);color:#22c55e}.test-result.fail{background:rgba(239,68,68,.1);color:#ef4444}`]
})
export class AdminApiKeysComponent implements OnInit {
  keys = MOCK_API_KEYS; webhooks: any[] = []; showCreate = false;
  constructor(private whSvc: WebhookService, private exportSvc: ExportService) {}
  ngOnInit() { this.whSvc.getWebhooks().subscribe(w => this.webhooks = w); }
  maskKey(k: string) { return k.substring(0, 12) + '...' + k.substring(k.length - 4); }
  copy(k: string) { navigator.clipboard?.writeText(k); }
  testWebhook(w: any) { this.whSvc.testWebhook(w.id).subscribe(r => w.testResult = r); }
  exportKeys() {
    this.exportSvc.exportExcel(this.keys, [
      {header:'Organization',key:'organization'},{header:'Key',key:'key'},{header:'Scope',key:'scope'},
      {header:'Rate Limit',key:'rateLimit'},{header:'Usage',key:'usageCount'}
    ], 'api-keys');
  }
}