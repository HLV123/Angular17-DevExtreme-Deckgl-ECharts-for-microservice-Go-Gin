import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-integrations', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><h1><i class="fas fa-plug"></i> Tích hợp Nguồn Dữ liệu</h1><p>{{integrations.length}} nguồn dữ liệu · {{active}} đang hoạt động</p></div>
    <div class="int-grid"><div *ngFor="let i of integrations" class="int-card" [class.active]="i.isActive">
      <div class="int-top"><div class="int-icon" [style.background]="i.color+'20'" [style.color]="i.color"><i class="fas" [ngClass]="i.icon"></i></div>
        <span class="int-status" [ngClass]="i.isActive?'on':'off'">{{i.isActive?'Đang kết nối':'Tắt'}}</span></div>
      <h3>{{i.name}}</h3><p class="int-desc">{{i.description}}</p>
      <div class="int-meta"><div class="im"><span class="iml">Endpoint</span><code>{{i.endpoint}}</code></div>
        <div class="im"><span class="iml">Lịch import</span><span>{{i.schedule}}</span></div>
        <div class="im"><span class="iml">Lần cuối</span><span>{{i.lastSync}}</span></div>
        <div class="im"><span class="iml">Records</span><span class="imv">{{i.recordCount | number}}</span></div></div>
      <div class="int-actions"><button class="abtn" (click)="testConnection(i)"><i class="fas fa-plug"></i> Test</button>
        <button class="abtn" (click)="syncNow(i)"><i class="fas fa-sync"></i> Sync</button>
        <button class="abtn" [class.danger]="i.isActive" (click)="i.isActive=!i.isActive">
          <i class="fas" [ngClass]="i.isActive?'fa-pause':'fa-play'"></i> {{i.isActive?'Tắt':'Bật'}}</button></div>
      <div class="test-result" *ngIf="i.testResult" [ngClass]="i.testResult"><i class="fas" [ngClass]="i.testResult==='success'?'fa-check-circle':'fa-times-circle'"></i> {{i.testResult==='success'?'Kết nối thành công!':'Kết nối thất bại'}}</div>
    </div></div>
    <div class="swagger-card"><h3><i class="fas fa-book"></i> API Documentation (Swagger UI)</h3><p>Trang tài liệu API tích hợp cho đối tác</p>
      <div class="swagger-frame"><div class="sf-header"><span class="sf-method get">GET</span><code>/api/v1/public/aqi/current</code><span class="sf-desc">AQI hiện tại tất cả trạm</span></div>
        <div class="sf-header"><span class="sf-method get">GET</span><code>/api/v1/public/aqi/history</code><span class="sf-desc">Lịch sử AQI</span></div>
        <div class="sf-header"><span class="sf-method get">GET</span><code>/api/v1/public/stations</code><span class="sf-desc">Danh sách trạm</span></div>
        <div class="sf-header"><span class="sf-method get">GET</span><code>/api/v1/public/forecast</code><span class="sf-desc">Dự báo AQI</span></div>
        <div class="sf-header"><span class="sf-method post">POST</span><code>/api/v1/data/upload</code><span class="sf-desc">Upload dữ liệu CSV</span></div>
        <div class="sf-header"><span class="sf-method ws">WS</span><code>/ws/aqi-realtime</code><span class="sf-desc">WebSocket AQI realtime</span></div></div>
      <button class="btn-primary"><i class="fas fa-external-link-alt"></i> Mở Swagger UI đầy đủ</button></div></div>`,
  styles: [`.pg-hdr{margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .int-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:14px;margin-bottom:20px}
    .int-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:18px;transition:all .2s}.int-card.active{border-left:3px solid #22c55e}.int-card:hover{border-color:rgba(56,189,248,.3)}
    .int-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.int-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.int-status{padding:4px 10px;border-radius:8px;font-size:10px;font-weight:700}.int-status.on{background:rgba(34,197,94,.1);color:#22c55e}.int-status.off{background:rgba(100,116,139,.1);color:#64748b}
    .int-card h3{font-family:'Outfit';font-size:15px;color:#f1f5f9;margin-bottom:6px}.int-desc{font-size:12px;color:#94a3b8;margin-bottom:12px}
    .int-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}.im{background:rgba(15,23,42,.4);padding:8px 10px;border-radius:8px;font-size:11px;color:#cbd5e1}.iml{display:block;font-size:9px;color:#64748b;text-transform:uppercase;margin-bottom:2px}.imv{font-family:'Outfit';font-weight:700;color:#38bdf8}.im code{font-family:'JetBrains Mono';font-size:10px;color:#22c55e;word-break:break-all}
    .int-actions{display:flex;gap:6px;margin-bottom:8px}.abtn{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;gap:5px;transition:all .2s}.abtn:hover{background:rgba(56,189,248,.15)}.abtn.danger{border-color:rgba(239,68,68,.3);color:#ef4444;background:rgba(239,68,68,.05)}
    .test-result{padding:8px 12px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:6px;margin-top:6px}.test-result.success{background:rgba(34,197,94,.1);color:#22c55e}.test-result.failed{background:rgba(239,68,68,.1);color:#ef4444}
    .swagger-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px}.swagger-card h3{font-family:'Outfit';font-size:16px;color:#e2e8f0;margin-bottom:6px;display:flex;align-items:center;gap:8px}.swagger-card h3 i{color:#38bdf8}.swagger-card>p{font-size:13px;color:#94a3b8;margin-bottom:14px}
    .swagger-frame{background:rgba(15,23,42,.5);border-radius:12px;padding:12px;margin-bottom:14px}.sf-header{display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid rgba(51,65,85,.3);font-size:12px;color:#cbd5e1}.sf-method{padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;font-family:'JetBrains Mono'}.sf-method.get{background:rgba(34,197,94,.15);color:#22c55e}.sf-method.post{background:rgba(56,189,248,.15);color:#38bdf8}.sf-method.ws{background:rgba(139,92,246,.15);color:#a78bfa}.sf-header code{font-family:'JetBrains Mono';font-size:11px;color:#e2e8f0;flex:1}.sf-desc{font-size:11px;color:#64748b}
    .btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:8px}`]
})
export class AdminIntegrationsComponent {
  active = 3;
  integrations: any[] = [
    { name: 'OpenWeatherMap API', description: 'Dữ liệu thời tiết realtime: nhiệt độ, độ ẩm, gió, áp suất', endpoint: 'api.openweathermap.org/data/2.5', icon: 'fa-cloud-sun', color: '#f97316', schedule: 'Mỗi 30 phút', lastSync: '5 phút trước', recordCount: 48200, isActive: true, testResult: null },
    { name: 'NASA FIRMS', description: 'Dữ liệu vệ tinh cháy rừng và điểm nóng nhiệt', endpoint: 'firms.modaps.eosdis.nasa.gov', icon: 'fa-satellite', color: '#ef4444', schedule: 'Mỗi 6 giờ', lastSync: '2 giờ trước', recordCount: 1250, isActive: true, testResult: null },
    { name: 'Sentinel-5P (NO2)', description: 'Ảnh vệ tinh NO2 concentration từ ESA Copernicus', endpoint: 'scihub.copernicus.eu/dhus', icon: 'fa-globe-europe', color: '#8b5cf6', schedule: 'Hàng ngày 06:00', lastSync: 'Hôm qua 06:12', recordCount: 365, isActive: true, testResult: null },
    { name: 'Google Maps Traffic', description: 'Dữ liệu mật độ giao thông realtime tại các nút giao', endpoint: 'maps.googleapis.com/maps/api', icon: 'fa-car', color: '#eab308', schedule: 'Mỗi 15 phút', lastSync: '12 phút trước', recordCount: 95600, isActive: false, testResult: null },
    { name: 'IMH Việt Nam', description: 'Dữ liệu khí tượng thủy văn từ Viện Khí tượng Thủy văn', endpoint: 'imh.gov.vn/api/v1', icon: 'fa-temperature-high', color: '#22c55e', schedule: 'Mỗi giờ', lastSync: '45 phút trước', recordCount: 12800, isActive: false, testResult: null },
  ];
  testConnection(i: any) { i.testResult = Math.random() > 0.2 ? 'success' : 'failed'; }
  syncNow(i: any) { i.lastSync = 'Vừa xong'; i.recordCount += Math.floor(Math.random() * 100); }
}
