import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_POLLUTION_SOURCES } from '../../core/mock-data/others.mock';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-sources', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-smog"></i> Quản lý Nguồn Ô nhiễm</h1>
    <p>{{sources.length}} nguồn · {{activeCount}} đang hoạt động</p></div>
    <div class="hdr-acts"><button class="btn-export" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
      <button class="btn-export" style="color:#ef4444;border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.1)" (click)="exportPdf()"><i class="fas fa-file-pdf"></i> PDF</button>
      <button class="btn-primary" (click)="showAdd=true"><i class="fas fa-plus"></i> Thêm nguồn</button></div></div>

    <div class="filter-bar"><select [(ngModel)]="fType" (change)="filter()" class="sel"><option value="">Tất cả loại</option>
      <option *ngFor="let t of typeOptions" [value]="t.value">{{t.label}}</option></select>
      <select [(ngModel)]="fImpact" (change)="filter()" class="sel"><option value="">Tất cả mức ảnh hưởng</option>
        <option value="critical">Nghiêm trọng</option><option value="high">Cao</option><option value="medium">Trung bình</option><option value="low">Thấp</option></select>
      <input [(ngModel)]="fSearch" (input)="filter()" class="sel" placeholder="Tìm kiếm..." style="flex:1"/></div>

    <div class="src-grid"><div *ngFor="let s of filtered" class="src-card" [class.active]="s.isActive" (click)="selectSource(s)">
      <div class="src-top"><i class="fas" [ngClass]="iconFor(s.type)"></i><span class="src-type" [ngClass]="'t-'+s.type">{{typeLbl(s.type)}}</span>
        <span class="src-impact" [ngClass]="'i-'+s.impactLevel">{{impactLbl(s.impactLevel)}}</span></div>
      <h3>{{s.name}}</h3><p class="src-addr"><i class="fas fa-map-marker-alt"></i> {{s.address}} · {{s.district}}</p>
      <div class="src-detail"><div class="sd"><span>Đơn vị quản lý</span><b>{{s.operator}}</b></div>
        <div class="sd"><span>Giấy phép</span><b>{{s.licenseNo || 'N/A'}}</b></div></div>
      <p class="src-desc">{{s.description}}</p>
    </div></div>

    <!-- Detail Panel -->
    <div class="detail-panel" *ngIf="selected">
      <div class="dp-header"><h2>{{selected.name}}</h2><button class="close-btn" (click)="selected=null"><i class="fas fa-times"></i></button></div>
      <div class="dp-grid">
        <div class="dp-section"><h4>Thông tin cơ bản</h4>
          <div class="dp-row"><span>Loại</span><b>{{typeLbl(selected.type)}}</b></div>
          <div class="dp-row"><span>Địa chỉ</span><b>{{selected.address}}</b></div>
          <div class="dp-row"><span>Quận/Huyện</span><b>{{selected.district}}</b></div>
          <div class="dp-row"><span>Tọa độ</span><b>{{selected.latitude}}, {{selected.longitude}}</b></div>
          <div class="dp-row"><span>Đơn vị</span><b>{{selected.operator}}</b></div>
          <div class="dp-row"><span>Giấy phép</span><b>{{selected.licenseNo || 'Chưa có'}}</b></div>
          <div class="dp-row"><span>Mức ảnh hưởng</span><b [ngClass]="'ic-'+selected.impactLevel">{{impactLbl(selected.impactLevel)}}</b></div>
        </div>
        <div class="dp-section"><h4>Lịch sử Vi phạm</h4>
          <div *ngFor="let v of violations" class="violation-item">
            <span class="v-date">{{v.date}}</span><span class="v-type">{{v.type}}</span><span class="v-fine">{{v.fine}}</span>
          </div>
        </div>
        <div class="dp-section"><h4>Mô hình Lan truyền (Gaussian Plume)</h4>
          <p class="dp-desc">Tính toán vùng ảnh hưởng dựa trên: vị trí nguồn, cường độ phát thải, hướng gió, tốc độ gió</p>
          <div class="plume-params">
            <div class="pp"><label>Cường độ (g/s)</label><input type="number" value="150" class="pp-input"/></div>
            <div class="pp"><label>Hướng gió (°)</label><input type="number" value="225" class="pp-input"/></div>
            <div class="pp"><label>Tốc độ gió (m/s)</label><input type="number" value="3.5" class="pp-input"/></div>
            <div class="pp"><label>Chiều cao ống (m)</label><input type="number" value="45" class="pp-input"/></div>
          </div>
          <button class="btn-primary" style="margin-top:10px"><i class="fas fa-calculator"></i> Tính toán & Hiển thị trên bản đồ</button>
        </div>
      </div>
    </div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:8px}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:9px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px}.btn-export{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
    .filter-bar{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}.sel{background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:10px;font-size:12px;min-width:150px}
    .src-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px;margin-bottom:16px}
    .src-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:16px;cursor:pointer;transition:all .2s}.src-card:hover{border-color:rgba(56,189,248,.3);transform:translateY(-1px)}.src-card.active{border-left:3px solid #22c55e}
    .src-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}.src-top i{font-size:16px;color:#38bdf8}.src-type{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase}.t-industrial{background:rgba(249,115,22,.1);color:#f97316}.t-traffic{background:rgba(239,68,68,.1);color:#ef4444}.t-residential{background:rgba(234,179,8,.1);color:#eab308}.t-agriculture{background:rgba(34,197,94,.1);color:#22c55e}.t-natural{background:rgba(139,92,246,.1);color:#a78bfa}
    .src-impact{margin-left:auto;padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700}.i-critical{background:rgba(239,68,68,.15);color:#ef4444}.i-high{background:rgba(249,115,22,.12);color:#f97316}.i-medium{background:rgba(234,179,8,.1);color:#eab308}.i-low{background:rgba(34,197,94,.1);color:#22c55e}
    .src-card h3{font-family:'Outfit';font-size:14px;color:#f1f5f9;margin-bottom:4px}.src-addr{font-size:11px;color:#64748b;margin-bottom:8px}.src-addr i{margin-right:4px}
    .src-detail{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px}.sd{background:rgba(15,23,42,.4);padding:6px 8px;border-radius:6px;font-size:10px;color:#64748b}.sd b{display:block;color:#cbd5e1;font-size:11px}.src-desc{font-size:11px;color:#94a3b8;line-height:1.4}
    .detail-panel{background:rgba(30,41,59,.8);border:1px solid rgba(56,189,248,.2);border-radius:16px;padding:24px;margin-top:16px}
    .dp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.dp-header h2{font-family:'Outfit';font-size:18px;color:#f1f5f9}.close-btn{background:none;border:none;color:#64748b;font-size:18px;cursor:pointer}
    .dp-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
    .dp-section h4{font-family:'Outfit';font-size:13px;color:#94a3b8;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(51,65,85,.3)}
    .dp-row{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#64748b;border-bottom:1px solid rgba(51,65,85,.15)}.dp-row b{color:#e2e8f0}
    .ic-critical{color:#ef4444}.ic-high{color:#f97316}.ic-medium{color:#eab308}.ic-low{color:#22c55e}
    .violation-item{display:flex;gap:10px;padding:8px;background:rgba(239,68,68,.05);border-radius:8px;margin-bottom:6px;font-size:11px}.v-date{color:#64748b;min-width:80px}.v-type{color:#ef4444;flex:1}.v-fine{color:#f97316;font-weight:700}
    .dp-desc{font-size:12px;color:#94a3b8;margin-bottom:12px}
    .plume-params{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pp label{display:block;font-size:10px;color:#64748b;margin-bottom:3px}.pp-input{width:100%;background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:7px 10px;border-radius:8px;font-size:12px}
    @media(max-width:900px){.dp-grid{grid-template-columns:1fr}}`]
})
export class SourcesComponent implements OnInit {
  sources = MOCK_POLLUTION_SOURCES; filtered = [...MOCK_POLLUTION_SOURCES];
  fType = ''; fImpact = ''; fSearch = ''; showAdd = false; selected: any = null; activeCount = 0;
  typeOptions = [{ value: 'industrial', label: 'Công nghiệp' }, { value: 'traffic', label: 'Giao thông' }, { value: 'residential', label: 'Sinh hoạt' }, { value: 'agriculture', label: 'Nông nghiệp' }, { value: 'natural', label: 'Tự nhiên' }];
  violations = [
    { date: '15/03/2025', type: 'Vượt ngưỡng phát thải PM2.5', fine: '50,000,000 VNĐ' },
    { date: '22/01/2025', type: 'Không có giấy phép xả thải', fine: '100,000,000 VNĐ' },
    { date: '08/11/2024', type: 'Hoạt động ngoài giờ quy định', fine: '20,000,000 VNĐ' },
  ];
  constructor(private exportSvc: ExportService) { }
  ngOnInit() { this.activeCount = this.sources.filter(s => s.isActive).length; }
  filter() {
    let r = [...this.sources];
    if (this.fType) r = r.filter(s => s.type === this.fType);
    if (this.fImpact) r = r.filter(s => s.impactLevel === this.fImpact);
    if (this.fSearch) { const q = this.fSearch.toLowerCase(); r = r.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)); }
    this.filtered = r;
  }
  selectSource(s: any) { this.selected = this.selected?.id === s.id ? null : s; }
  typeLbl(t: string) { return { industrial: 'Công nghiệp', traffic: 'Giao thông', residential: 'Sinh hoạt', agriculture: 'Nông nghiệp', natural: 'Tự nhiên' }[t] || t; }
  impactLbl(l: string) { return { critical: 'Nghiêm trọng', high: 'Cao', medium: 'Trung bình', low: 'Thấp' }[l] || l; }
  iconFor(t: string) { return { industrial: 'fa-industry', traffic: 'fa-traffic-light', residential: 'fa-dumpster', agriculture: 'fa-seedling', natural: 'fa-mountain' }[t] || 'fa-smog'; }
  exportExcel() {
    this.exportSvc.exportExcel(this.filtered, [
      { header: 'Tên', key: 'name', width: 30 }, { header: 'Loại', key: 'type', width: 15 }, { header: 'Địa chỉ', key: 'address', width: 35 },
      { header: 'Quận', key: 'district', width: 15 }, { header: 'Mức ảnh hưởng', key: 'impactLevel', width: 15 }, { header: 'Đơn vị', key: 'operator', width: 25 }
    ], 'nguon-o-nhiem');
  }
  exportPdf() {
    const rows = this.filtered.map(s => `<tr><td>${s.name}</td><td>${this.typeLbl(s.type)}</td><td>${s.address}</td><td>${s.district}</td><td>${this.impactLbl(s.impactLevel)}</td></tr>`).join('');
    this.exportSvc.exportPdf('Nguồn Ô nhiễm', `<table><thead><tr><th>Tên</th><th>Loại</th><th>Địa chỉ</th><th>Quận</th><th>Mức AH</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
}
