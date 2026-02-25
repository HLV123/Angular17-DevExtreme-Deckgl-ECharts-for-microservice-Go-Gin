import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_SYSTEM_HEALTH } from '../../../core/mock-data/others.mock';

@Component({
  selector: 'app-admin-health', standalone: true, imports: [CommonModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-heartbeat"></i> System Health Check</h1>
    <p>{{healthyCount}}/{{services.length}} dịch vụ hoạt động bình thường · Uptime: {{uptime}}</p></div>
    <div class="hdr-acts"><span class="live-dot"></span><span style="color:#22c55e;font-size:12px;font-weight:600">Live</span>
      <a href="http://grafana.urbanair.local:3000" target="_blank" class="btn-outline"><i class="fas fa-chart-line"></i> Grafana</a>
      <a href="http://prometheus.urbanair.local:9090" target="_blank" class="btn-outline"><i class="fas fa-database"></i> Prometheus</a></div></div>

    <div class="sys-meters">
      <div class="meter-card"><div class="meter-ring" [style.background]="'conic-gradient(#38bdf8 '+cpu+'%,rgba(51,65,85,.3) 0)'"><span>{{cpu}}%</span></div><p>CPU</p></div>
      <div class="meter-card"><div class="meter-ring" [style.background]="'conic-gradient(#22c55e '+ram+'%,rgba(51,65,85,.3) 0)'"><span>{{ram}}%</span></div><p>RAM</p></div>
      <div class="meter-card"><div class="meter-ring" [style.background]="'conic-gradient(#f97316 '+disk+'%,rgba(51,65,85,.3) 0)'"><span>{{disk}}%</span></div><p>Disk</p></div>
      <div class="meter-card"><div class="meter-ring" [style.background]="'conic-gradient(#a78bfa '+net+'%,rgba(51,65,85,.3) 0)'"><span>{{net}}%</span></div><p>Network</p></div>
    </div>

    <div class="svc-grid"><div *ngFor="let s of services" class="svc-card" [ngClass]="'st-'+s.status">
      <div class="svc-top"><span class="svc-dot" [ngClass]="s.status"></span><h3>{{s.serviceName}}</h3><span class="svc-status">{{statusLbl(s.status)}}</span></div>
      <p class="svc-ver">v{{"1.0"}} · Port {{"—" || 'N/A'}}</p>
      <div class="svc-metrics">
        <div class="sm"><span>CPU</span><div class="sm-bar"><div [style.width.%]="s.cpu" [style.background]="barColor(s.cpu)"></div></div><b>{{s.cpu}}%</b></div>
        <div class="sm"><span>RAM</span><div class="sm-bar"><div [style.width.%]="s.memory" [style.background]="barColor(s.memory)"></div></div><b>{{s.memory}}%</b></div>
      </div>
      <div class="svc-latency">
        <span>p50: <b>{{s.latencyP50}}ms</b></span><span>p95: <b>{{s.latencyP95}}ms</b></span><span>p99: <b>{{s.latencyP99}}ms</b></span>
      </div>
      <div class="svc-footer"><span>{{s.requestsPerSecond}} req/s</span><span>Uptime: {{s.uptime}}h</span></div>
    </div></div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#ef4444}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:8px;align-items:center}.live-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.btn-outline{background:none;border:1px solid rgba(56,189,248,.3);color:#38bdf8;padding:7px 14px;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:6px}
    .sys-meters{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
    .meter-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:20px;text-align:center}
    .meter-ring{width:80px;height:80px;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;position:relative}.meter-ring span{background:#0f172a;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Outfit';font-size:16px;font-weight:800;color:#f1f5f9}.meter-card p{font-size:12px;color:#94a3b8;font-weight:600}
    .svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px}
    .svc-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:16px;transition:all .2s}.svc-card.st-healthy{border-left:3px solid #22c55e}.svc-card.st-degraded{border-left:3px solid #eab308}.svc-card.st-down{border-left:3px solid #ef4444}
    .svc-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}.svc-dot{width:8px;height:8px;border-radius:50%}.svc-dot.healthy{background:#22c55e}.svc-dot.degraded{background:#eab308}.svc-dot.down{background:#ef4444}
    .svc-top h3{font-family:'Outfit';font-size:14px;color:#f1f5f9;flex:1}.svc-status{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px}.st-healthy .svc-status{background:rgba(34,197,94,.1);color:#22c55e}.st-degraded .svc-status{background:rgba(234,179,8,.1);color:#eab308}.st-down .svc-status{background:rgba(239,68,68,.1);color:#ef4444}
    .svc-ver{font-size:10px;color:#64748b;margin-bottom:10px}
    .svc-metrics{margin-bottom:8px}.sm{display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:10px;color:#64748b}.sm span{min-width:28px}.sm-bar{flex:1;height:6px;background:rgba(51,65,85,.5);border-radius:3px;overflow:hidden}.sm-bar div{height:100%;border-radius:3px;transition:width .5s}.sm b{min-width:30px;text-align:right;color:#cbd5e1;font-size:10px}
    .svc-latency{display:flex;gap:12px;font-size:10px;color:#64748b;margin-bottom:8px;padding:6px;background:rgba(15,23,42,.4);border-radius:6px}.svc-latency b{color:#e2e8f0}
    .svc-footer{display:flex;justify-content:space-between;font-size:10px;color:#64748b;padding-top:6px;border-top:1px solid rgba(51,65,85,.2)}
    @media(max-width:600px){.sys-meters{grid-template-columns:1fr 1fr}}`]
})
export class AdminHealthComponent implements OnInit, OnDestroy {
  services = MOCK_SYSTEM_HEALTH; healthyCount = 0; uptime = '99.97%';
  cpu = 34; ram = 62; disk = 45; net = 18;
  private interval: any;
  ngOnInit() {
    this.healthyCount = this.services.filter(s => s.status === 'healthy').length;
    this.interval = setInterval(() => this.refreshMetrics(), 10000);
  }
  ngOnDestroy() { clearInterval(this.interval); }
  refreshMetrics() {
    this.cpu = Math.min(95, Math.max(10, this.cpu + Math.round((Math.random() - 0.5) * 8)));
    this.ram = Math.min(90, Math.max(30, this.ram + Math.round((Math.random() - 0.5) * 4)));
    this.services.forEach(s => { s.cpu = Math.min(95, Math.max(1, s.cpu + Math.round((Math.random() - 0.5) * 5))); });
  }
  statusLbl(s: string) { return { healthy: 'Healthy', degraded: 'Degraded', down: 'Down' }[s] || s; }
  barColor(v: number) { return v > 80 ? '#ef4444' : v > 60 ? '#eab308' : '#22c55e'; }
}
