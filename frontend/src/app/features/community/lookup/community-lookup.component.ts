import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_COMMUNITY_REPORTS } from '../../../core/mock-data/others.mock';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
    selector: 'app-community-lookup', standalone: true, imports: [CommonModule, FormsModule],
    template: `
    <div class="page animate-fade-in">
      <div class="pg-hdr">
        <div><h1><i class="fas fa-search-location"></i> Tra cứu & Bản đồ Phản ánh</h1>
        <p>Tra cứu phản ánh theo mã hoặc xem trên bản đồ</p></div>
      </div>
      <!-- Lookup Section -->
      <div class="lookup-section">
        <div class="lookup-card">
          <h3><i class="fas fa-search"></i> Tra cứu theo mã</h3>
          <div class="lookup-input">
            <input [(ngModel)]="lookupCode" placeholder="Nhập mã phản ánh, VD: UA-2025-001" (keyup.enter)="lookup()" />
            <button class="btn-primary" (click)="lookup()"><i class="fas fa-search"></i> Tra cứu</button>
          </div>
          <div *ngIf="foundReport" class="result-card">
            <div class="rc-header">
              <span class="rc-code">PA-{{foundReport.code}}</span>
              <span class="st-badge" [ngClass]="'st-'+foundReport.status">{{statusLbl(foundReport.status)}}</span>
            </div>
            <div class="rc-body">
              <div class="rc-row"><span class="rc-label">Loại</span><span>{{foundReport.type}}</span></div>
              <div class="rc-row"><span class="rc-label">Mô tả</span><span>{{foundReport.description}}</span></div>
              <div class="rc-row"><span class="rc-label">Địa chỉ</span><span>{{foundReport.address}}</span></div>
              <div class="rc-row"><span class="rc-label">Ngày gửi</span><span>{{foundReport.createdAt | date:'dd/MM/yyyy HH:mm'}}</span></div>
              <div class="rc-row"><span class="rc-label">Người xử lý</span><span>{{foundReport.assignedTo || 'Chưa giao'}}</span></div>
            </div>
            <div *ngIf="foundReport.processingNotes.length" class="timeline-section">
              <h4><i class="fas fa-history"></i> Tiến trình xử lý</h4>
              <div *ngFor="let note of foundReport.processingNotes" class="tl-item">
                <div class="tl-dot"></div>
                <div class="tl-content">
                  <span class="tl-time">{{note.createdAt | date:'dd/MM HH:mm'}}</span>
                  <span class="tl-user">{{note.userName}}</span>
                  <p>{{note.content}}</p>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="notFound" class="not-found"><i class="fas fa-exclamation-circle"></i> Không tìm thấy phản ánh với mã này</div>
        </div>
      </div>
      <!-- Map Section -->
      <div class="map-section">
        <div class="map-header-bar">
          <h3><i class="fas fa-map-marked-alt"></i> Bản đồ phản ánh ({{reports.length}} địa điểm)</h3>
          <div class="map-filters">
            <select [(ngModel)]="filterType" (change)="updateMap()" class="map-select">
              <option value="">Tất cả loại</option>
              <option *ngFor="let t of types" [value]="t">{{t}}</option>
            </select>
            <select [(ngModel)]="filterStatus" (change)="updateMap()" class="map-select">
              <option value="">Tất cả trạng thái</option>
              <option value="new">Mới</option><option value="processing">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option><option value="closed">Đã đóng</option>
            </select>
          </div>
        </div>
        <div class="map-container-wrapper">
          <div id="communityMap" class="map-box"></div>
          <!-- Heatmap density -->
          <div class="density-legend">
            <span class="dl-title">Mật độ phản ánh</span>
            <div class="dl-bar"></div>
            <div class="dl-labels"><span>Ít</span><span>Nhiều</span></div>
          </div>
        </div>
      </div>
      <!-- Selected from map -->
      <div *ngIf="selectedReport" class="map-popup-panel">
        <button class="close-btn" (click)="selectedReport=null"><i class="fas fa-times"></i></button>
        <span class="rc-code">PA-{{selectedReport.code}}</span>
        <span class="st-badge" [ngClass]="'st-'+selectedReport.status">{{statusLbl(selectedReport.status)}}</span>
        <p class="pp-type">{{selectedReport.type}}</p>
        <p class="pp-desc">{{selectedReport.description}}</p>
        <p class="pp-addr"><i class="fas fa-map-marker-alt"></i> {{selectedReport.address}}</p>
      </div>
    </div>
  `,
    styles: [`
    .pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#22c55e}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .lookup-section{margin-bottom:24px}.lookup-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:24px}
    .lookup-card h3{font-family:'Outfit';font-size:16px;color:#e2e8f0;display:flex;align-items:center;gap:8px;margin-bottom:16px}.lookup-card h3 i{color:#38bdf8}
    .lookup-input{display:flex;gap:10px}.lookup-input input{flex:1;background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:12px 16px;border-radius:10px;font-size:14px;outline:none}
    .btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px;white-space:nowrap}
    .result-card{margin-top:20px;background:rgba(15,23,42,.5);border:1px solid rgba(56,189,248,.2);border-radius:14px;padding:20px;animation:fadeIn .3s}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .rc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.rc-code{font-family:'JetBrains Mono';font-size:16px;color:#38bdf8;font-weight:700}
    .st-badge{padding:4px 12px;border-radius:8px;font-size:11px;font-weight:600}.st-new{background:rgba(56,189,248,.1);color:#38bdf8}.st-reviewing{background:rgba(139,92,246,.1);color:#a78bfa}.st-assigned{background:rgba(249,115,22,.1);color:#f97316}.st-processing{background:rgba(234,179,8,.1);color:#eab308}.st-resolved{background:rgba(34,197,94,.1);color:#22c55e}.st-closed{background:rgba(100,116,139,.1);color:#94a3b8}
    .rc-body{display:grid;gap:8px}.rc-row{display:flex;gap:12px;font-size:13px;color:#e2e8f0}.rc-label{color:#64748b;min-width:80px;font-weight:600;font-size:11px;text-transform:uppercase}
    .timeline-section{margin-top:16px;padding-top:16px;border-top:1px solid rgba(51,65,85,.3)}.timeline-section h4{font-size:13px;color:#94a3b8;margin-bottom:12px;display:flex;align-items:center;gap:6px}
    .tl-item{display:flex;gap:12px;margin-bottom:10px;position:relative;padding-left:16px}.tl-dot{width:8px;height:8px;border-radius:50%;background:#38bdf8;position:absolute;left:0;top:6px}.tl-content{flex:1}.tl-time{font-size:10px;color:#64748b;font-family:'JetBrains Mono'}.tl-user{font-size:11px;color:#38bdf8;font-weight:600;margin-left:8px}.tl-content p{font-size:12px;color:#cbd5e1;margin-top:2px}
    .not-found{margin-top:16px;padding:16px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:10px;color:#ef4444;font-size:13px;display:flex;align-items:center;gap:8px}
    .map-section{margin-bottom:20px}.map-header-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.map-header-bar h3{font-family:'Outfit';font-size:16px;color:#e2e8f0;display:flex;align-items:center;gap:8px}.map-header-bar h3 i{color:#38bdf8}
    .map-filters{display:flex;gap:8px}.map-select{background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:8px 12px;border-radius:8px;font-size:12px;cursor:pointer}
    .map-container-wrapper{position:relative;border-radius:16px;overflow:hidden;border:1px solid rgba(51,65,85,.4)}.map-box{height:450px;background:#0f172a}
    .density-legend{position:absolute;bottom:16px;right:16px;background:rgba(15,23,42,.9);backdrop-filter:blur(10px);border:1px solid #334155;border-radius:10px;padding:10px 14px;z-index:1000}
    .dl-title{font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px}.dl-bar{height:6px;width:100px;border-radius:3px;background:linear-gradient(90deg,#22c55e,#eab308,#ef4444)}.dl-labels{display:flex;justify-content:space-between;font-size:9px;color:#64748b;margin-top:3px}
    .map-popup-panel{position:fixed;bottom:24px;right:24px;width:320px;background:rgba(15,23,42,.95);backdrop-filter:blur(20px);border:1px solid #334155;border-radius:16px;padding:20px;z-index:1000;animation:fadeIn .3s}
    .close-btn{position:absolute;top:10px;right:10px;background:none;border:none;color:#64748b;cursor:pointer;font-size:14px}
    .pp-type{font-size:14px;color:#e2e8f0;font-weight:600;margin-top:8px}.pp-desc{font-size:12px;color:#94a3b8;margin-top:4px}.pp-addr{font-size:11px;color:#64748b;margin-top:6px;display:flex;align-items:center;gap:4px}.pp-addr i{color:#38bdf8}
    ::ng-deep .marker-cluster-small{background-color:rgba(34,197,94,.6)}::ng-deep .marker-cluster-small div{background-color:rgba(34,197,94,.9);color:white}::ng-deep .marker-cluster-medium{background-color:rgba(249,115,22,.6)}::ng-deep .marker-cluster-medium div{background-color:rgba(249,115,22,.9);color:white}::ng-deep .marker-cluster-large{background-color:rgba(239,68,68,.6)}::ng-deep .marker-cluster-large div{background-color:rgba(239,68,68,.9);color:white}::ng-deep .marker-cluster{background-clip:padding-box;border-radius:20px}::ng-deep .marker-cluster div{width:30px;height:30px;margin-left:5px;margin-top:5px;text-align:center;border-radius:15px;font-family:'Outfit';font-weight:bold;line-height:30px}
  `]
})
export class CommunityLookupComponent implements OnInit, AfterViewInit, OnDestroy {
    reports = [...MOCK_COMMUNITY_REPORTS];
    filteredReports = [...MOCK_COMMUNITY_REPORTS];
    lookupCode = ''; foundReport: any = null; notFound = false;
    selectedReport: any = null;
    filterType = ''; filterStatus = '';
    types = ['Ô nhiễm khói bụi', 'Đốt rác tự phát', 'Mùi hôi thối', 'Tiếng ồn', 'Nước thải'];
    statusList = [{ id: 'new', name: 'Mới' }, { id: 'reviewing', name: 'Xem xét' }, { id: 'assigned', name: 'Đã giao' }, { id: 'processing', name: 'Đang xử lý' }, { id: 'resolved', name: 'Đã giải quyết' }, { id: 'closed', name: 'Đã đóng' }];
    private map: L.Map | null = null;
    private clusterGroup: any = null;

    ngOnInit() { }
    ngAfterViewInit() { setTimeout(() => this.initMap(), 200); }
    ngOnDestroy() { this.map?.remove(); }

    lookup() {
        this.foundReport = null; this.notFound = false;
        const code = this.lookupCode.trim().toUpperCase().replace('PA-', '').replace('UA-', '');
        this.foundReport = this.reports.find(r => r.code.includes(code) || r.id.includes(code));
        if (!this.foundReport && code) this.notFound = true;
    }

    statusLbl(s: string) { return this.statusList.find(x => x.id === s)?.name || s; }

    statusColor(s: string): string {
        const m: Record<string, string> = { new: '#38bdf8', reviewing: '#a78bfa', assigned: '#f97316', processing: '#eab308', resolved: '#22c55e', closed: '#64748b' };
        return m[s] || '#64748b';
    }

    initMap() {
        this.map = L.map('communityMap', { zoomControl: false }).setView([21.0285, 105.8542], 11);
        L.control.zoom({ position: 'topright' }).addTo(this.map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CartoDB', maxZoom: 19 }).addTo(this.map);
        this.updateMap();
    }

    updateMap() {
        if (!this.map) return;
        if (this.clusterGroup) { this.map.removeLayer(this.clusterGroup); }
        this.clusterGroup = (L as any).markerClusterGroup({ maxClusterRadius: 50 });
        let filtered = [...this.reports];
        if (this.filterType) filtered = filtered.filter(r => r.type === this.filterType);
        if (this.filterStatus) filtered = filtered.filter(r => r.status === this.filterStatus);
        this.filteredReports = filtered;
        filtered.forEach(r => {
            const color = this.statusColor(r.status);
            const icon = L.divIcon({
                className: 'custom-marker', iconSize: [28, 28], iconAnchor: [14, 14],
                html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-size:10px;border:2px solid rgba(255,255,255,.3);box-shadow:0 0 12px ${color}60"><i class="fas fa-comment-dots"></i></div>`
            });
            const marker = L.marker([r.latitude, r.longitude], { icon }).on('click', () => { this.selectedReport = r; });
            this.clusterGroup.addLayer(marker);
        });
        this.map.addLayer(this.clusterGroup);
    }
}
