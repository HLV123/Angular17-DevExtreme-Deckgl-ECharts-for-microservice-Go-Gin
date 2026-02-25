import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_STATIONS } from '../../../core/mock-data/stations.mock';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-stations-devices', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-microchip"></i> Quản lý Thiết bị Sensor</h1>
    <p>{{totalSensors}} sensor · {{activeSensors}} hoạt động · {{needCalibration}} cần hiệu chuẩn</p></div>
    <div class="hdr-acts"><button class="btn-export" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Export</button>
      <button class="btn-primary" (click)="showAdd=true"><i class="fas fa-plus"></i> Thêm sensor</button></div></div>

    <div class="filter-bar"><select [(ngModel)]="fStation" (change)="filter()" class="sel"><option value="">Tất cả trạm</option>
      <option *ngFor="let s of stationList" [value]="s.id">{{s.name}}</option></select>
      <select [(ngModel)]="fStatus" (change)="filter()" class="sel"><option value="">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option><option value="inactive">Ngừng</option><option value="error">Lỗi</option><option value="calibrating">Hiệu chuẩn</option></select>
      <select [(ngModel)]="fType" (change)="filter()" class="sel"><option value="">Tất cả loại</option>
        <option *ngFor="let t of sensorTypes" [value]="t">{{t}}</option></select>
      <input [(ngModel)]="fSearch" (input)="filter()" class="sel" placeholder="Tìm serial..." style="flex:1"/></div>

    <div class="dev-grid"><div *ngFor="let d of filtered" class="dev-card" [ngClass]="'st-'+d.status" (click)="selectDevice(d)">
      <div class="dev-top"><i class="fas fa-microchip"></i><span class="dev-status" [ngClass]="d.status">{{statusLbl(d.status)}}</span></div>
      <h3>{{d.type}}</h3><p class="dev-model">{{d.model}} · Serial: {{d.serial}}</p>
      <div class="dev-meta"><div class="dm"><span>Trạm</span><b>{{d.stationName}}</b></div>
        <div class="dm"><span>Cài đặt</span><b>{{d.installedDate | date:'dd/MM/yyyy'}}</b></div>
        <div class="dm"><span>Hiệu chuẩn cuối</span><b [class.overdue]="d.calibrationOverdue">{{d.lastCalibration}}</b></div>
        <div class="dm"><span>Số đọc/ngày</span><b>{{d.readingsPerDay}}</b></div></div>
      <div class="dev-actions"><button class="abtn" (click)="$event.stopPropagation();calibrate(d)"><i class="fas fa-tools"></i> Hiệu chuẩn</button>
        <button class="abtn" (click)="$event.stopPropagation()"><i class="fas fa-edit"></i> Sửa</button></div>
    </div></div>

    <!-- Calibration History Panel -->
    <div class="cal-panel" *ngIf="selectedDevice">
      <div class="dp-header"><h2>{{selectedDevice.type}} — {{selectedDevice.serial}}</h2><button class="close-btn" (click)="selectedDevice=null"><i class="fas fa-times"></i></button></div>
      <h4>Lịch sử Hiệu chuẩn & Bảo dưỡng</h4>
      <div class="timeline"><div *ngFor="let e of calibrationHistory" class="tl-item" [ngClass]="e.type">
        <div class="tl-dot"></div>
        <div class="tl-content"><span class="tl-date">{{e.date}}</span><span class="tl-type">{{e.typeLabel}}</span><p>{{e.note}}</p><span class="tl-by">Bởi: {{e.technician}}</span></div>
      </div></div>
    </div>

    <!-- Add Sensor Modal -->
    <div class="modal-overlay" *ngIf="showAdd" (click)="showAdd=false">
      <div class="modal-card" (click)="$event.stopPropagation()"><h3>Thêm Sensor mới</h3>
        <div class="fg"><label>Loại sensor</label><select class="input"><option *ngFor="let t of sensorTypes">{{t}}</option></select></div>
        <div class="fg"><label>Model</label><input class="input" placeholder="VD: Plantower PMS7003"/></div>
        <div class="fg"><label>Serial Number</label><input class="input" placeholder="VD: PMS-2025-001"/></div>
        <div class="fg"><label>Gán vào trạm</label><select class="input"><option *ngFor="let s of stationList" [value]="s.id">{{s.name}}</option></select></div>
        <div class="fg"><label>Ngày cài đặt</label><input type="date" class="input"/></div>
        <div class="modal-acts"><button class="btn-cancel" (click)="showAdd=false">Hủy</button><button class="btn-primary">Thêm sensor</button></div>
      </div></div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:8px}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:9px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px}.btn-export{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
    .filter-bar{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}.sel{background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:10px;font-size:12px;min-width:140px}
    .dev-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
    .dev-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:16px;cursor:pointer;transition:all .2s}.dev-card:hover{border-color:rgba(56,189,248,.3)}.dev-card.st-active{border-left:3px solid #22c55e}.dev-card.st-error{border-left:3px solid #ef4444}.dev-card.st-inactive{border-left:3px solid #64748b}.dev-card.st-calibrating{border-left:3px solid #eab308}
    .dev-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.dev-top i{color:#38bdf8;font-size:16px}.dev-status{padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700}.dev-status.active{background:rgba(34,197,94,.1);color:#22c55e}.dev-status.error{background:rgba(239,68,68,.1);color:#ef4444}.dev-status.inactive{background:rgba(100,116,139,.1);color:#64748b}.dev-status.calibrating{background:rgba(234,179,8,.1);color:#eab308}
    .dev-card h3{font-family:'Outfit';font-size:14px;color:#f1f5f9;margin-bottom:2px}.dev-model{font-size:11px;color:#64748b;margin-bottom:8px}
    .dev-meta{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px}.dm{background:rgba(15,23,42,.4);padding:6px 8px;border-radius:6px;font-size:10px;color:#64748b}.dm b{display:block;color:#cbd5e1;font-size:11px}.dm b.overdue{color:#ef4444}
    .dev-actions{display:flex;gap:6px}.abtn{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;display:flex;align-items:center;gap:4px}
    .cal-panel{background:rgba(30,41,59,.8);border:1px solid rgba(56,189,248,.2);border-radius:16px;padding:20px;margin-top:16px}.dp-header{display:flex;justify-content:space-between;margin-bottom:12px}.dp-header h2{font-family:'Outfit';font-size:16px;color:#f1f5f9}.close-btn{background:none;border:none;color:#64748b;font-size:16px;cursor:pointer}.cal-panel h4{font-family:'Outfit';font-size:13px;color:#94a3b8;margin-bottom:12px}
    .timeline{padding-left:16px;border-left:2px solid rgba(51,65,85,.4)}.tl-item{position:relative;padding:0 0 16px 16px}.tl-dot{position:absolute;left:-21px;top:4px;width:10px;height:10px;border-radius:50%;background:#38bdf8;border:2px solid #0f172a}.tl-item.maintenance .tl-dot{background:#eab308}.tl-item.calibration .tl-dot{background:#22c55e}.tl-item.repair .tl-dot{background:#ef4444}
    .tl-date{font-size:10px;color:#64748b}.tl-type{font-size:11px;font-weight:700;color:#38bdf8;margin-left:8px}.tl-content p{font-size:11px;color:#cbd5e1;margin:4px 0}.tl-by{font-size:10px;color:#64748b}
    .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center}.modal-card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px;width:440px;max-width:90vw}.modal-card h3{font-family:'Outfit';font-size:18px;color:#f1f5f9;margin-bottom:16px}
    .fg{margin-bottom:10px}.fg label{display:block;font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:4px}.input{width:100%;background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:8px;font-size:12px;box-sizing:border-box}
    .modal-acts{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}.btn-cancel{background:rgba(51,65,85,.3);border:1px solid #334155;color:#94a3b8;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px}`]
})
export class StationsDevicesComponent implements OnInit {
  stationList = MOCK_STATIONS;
  devices: any[] = []; filtered: any[] = [];
  fStation = ''; fStatus = ''; fType = ''; fSearch = ''; showAdd = false; selectedDevice: any = null;
  sensorTypes = ['PM2.5', 'PM10', 'CO', 'NO₂', 'SO₂', 'O₃', 'Temperature', 'Humidity', 'Wind Speed', 'Wind Direction'];
  totalSensors = 0; activeSensors = 0; needCalibration = 0;
  calibrationHistory = [
    { date: '10/06/2025', type: 'calibration', typeLabel: 'Hiệu chuẩn', note: 'Hiệu chuẩn định kỳ - đạt chuẩn', technician: 'Nguyễn Văn Kỹ thuật' },
    { date: '15/04/2025', type: 'maintenance', typeLabel: 'Bảo dưỡng', note: 'Thay filter, vệ sinh buồng đo', technician: 'Trần Minh Bảo trì' },
    { date: '01/02/2025', type: 'calibration', typeLabel: 'Hiệu chuẩn', note: 'Hiệu chuẩn sau sửa chữa', technician: 'Nguyễn Văn Kỹ thuật' },
    { date: '20/12/2024', type: 'repair', typeLabel: 'Sửa chữa', note: 'Thay module đo PM2.5 bị lỗi', technician: 'Lê Anh Sửa chữa' },
  ];
  constructor(private exportSvc: ExportService) {}

  ngOnInit() {
    this.devices = [];
    MOCK_STATIONS.forEach(st => {
      (st.sensors || []).forEach((sensor: any) => {
        this.devices.push({
          ...sensor, stationId: st.id, stationName: st.name,
          installedDate: st.installedDate, readingsPerDay: Math.floor(Math.random() * 1000 + 200),
          lastCalibration: ['3 ngày trước', '2 tuần trước', '1 tháng trước', '45 ngày trước'][Math.floor(Math.random() * 4)],
          calibrationOverdue: Math.random() > 0.7
        });
      });
    });
    this.filtered = [...this.devices];
    this.totalSensors = this.devices.length;
    this.activeSensors = this.devices.filter(d => d.status === 'active').length;
    this.needCalibration = this.devices.filter(d => d.calibrationOverdue).length;
  }

  filter() {
    let r = [...this.devices];
    if (this.fStation) r = r.filter(d => d.stationId === this.fStation);
    if (this.fStatus) r = r.filter(d => d.status === this.fStatus);
    if (this.fType) r = r.filter(d => d.type === this.fType);
    if (this.fSearch) { const q = this.fSearch.toLowerCase(); r = r.filter(d => d.serial?.toLowerCase().includes(q) || d.model?.toLowerCase().includes(q)); }
    this.filtered = r;
  }

  selectDevice(d: any) { this.selectedDevice = this.selectedDevice?.serial === d.serial ? null : d; }
  calibrate(d: any) { d.lastCalibration = 'Vừa xong'; d.calibrationOverdue = false; }
  statusLbl(s: string) { return { active: 'Hoạt động', inactive: 'Ngừng', error: 'Lỗi', calibrating: 'Hiệu chuẩn' }[s] || s; }
  exportExcel() {
    this.exportSvc.exportExcel(this.filtered, [
      { header: 'Loại', key: 'type', width: 15 }, { header: 'Model', key: 'model', width: 25 },
      { header: 'Serial', key: 'serial', width: 20 }, { header: 'Trạm', key: 'stationName', width: 25 },
      { header: 'Trạng thái', key: 'status', width: 12 }
    ], 'thiet-bi-sensor');
  }
}
