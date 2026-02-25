import { ExportService } from '../../../core/services/export.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { StationService } from '../../../core/services/station.service';
import { UploadService } from '../../../core/services/upload.service';
import { Station } from '../../../core/models';
import { DISTRICTS } from '../../../core/mock-data/stations.mock';
import * as L from 'leaflet';
import { DxDataGridModule, DxFileUploaderModule } from 'devextreme-angular';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-stations-list', standalone: true, imports: [CommonModule, FormsModule, RouterModule, DxFileUploaderModule, DxDataGridModule],
  providers: [DatePipe],
  template: `
    <div class="page animate-fade-in">
      <div class="pg-hdr">
        <div>
          <h1><i class="fas fa-broadcast-tower"></i> Quản lý Trạm Quan trắc</h1>
          <p>{{stations.length}} trạm trên địa bàn Hà Nội</p>
        </div>
        <div class="hdr-acts">
          <button class="btn-outline" (click)="showImport=true"><i class="fas fa-upload"></i> Nhập hàng loạt</button>
          <button class="btn-outline" (click)="onExporting()"><i class="fas fa-file-excel"></i> Export</button>
          <button class="btn-primary" (click)="openAdd()"><i class="fas fa-plus"></i> Thêm trạm</button>
        </div>
      </div>
      <div class="kpi-row">
        <div class="kc"><div class="ki bg-blue"><i class="fas fa-broadcast-tower"></i></div><div><b>{{stations.length}}</b><span>Tổng trạm</span></div></div>
        <div class="kc"><div class="ki bg-green"><i class="fas fa-check-circle"></i></div><div><b>{{onlineCount}}</b><span>Online</span></div></div>
        <div class="kc"><div class="ki bg-red"><i class="fas fa-times-circle"></i></div><div><b>{{offlineCount}}</b><span>Offline</span></div></div>
        <div class="kc"><div class="ki bg-yellow"><i class="fas fa-wrench"></i></div><div><b>{{maintCount}}</b><span>Bảo trì</span></div></div>
      </div>
      <div class="split">
        <div class="tbl-wrap">
          <dx-data-grid
            id="gridContainer"
            [dataSource]="stations"
            [showBorders]="true"
            [allowColumnResizing]="true"
            [columnAutoWidth]="true"
            [rowAlternationEnabled]="true"
            [hoverStateEnabled]="true"
            keyExpr="id"
            (onFocusedRowChanged)="onFocusedRowChanged($event)"
            [focusedRowEnabled]="true"
            [focusedRowKey]="sel?.id"
            (onExporting)="onExportingGrid($event)"
          >
            <dxo-search-panel [visible]="true" [width]="240" placeholder="Tìm kiếm..."></dxo-search-panel>
            <dxo-filter-row [visible]="true"></dxo-filter-row>
            <dxo-header-filter [visible]="true"></dxo-header-filter>
            <dxo-paging [pageSize]="10"></dxo-paging>
            <dxo-pager [showPageSizeSelector]="true" [allowedPageSizes]="[5, 10, 20]" [showInfo]="true"></dxo-pager>
            <dxo-export [enabled]="true" [allowExportSelectedData]="true"></dxo-export>

            <dxi-column dataField="code" caption="Mã" cellTemplate="codeTemplate"></dxi-column>
            <dxi-column dataField="name" caption="Tên trạm" cellTemplate="nameTemplate"></dxi-column>
            <dxi-column dataField="district" caption="Quận/Huyện"></dxi-column>
            <dxi-column dataField="type" caption="Loại" cellTemplate="typeTemplate"></dxi-column>
            <dxi-column dataField="status" caption="Trạng thái" cellTemplate="statusTemplate"></dxi-column>
            <dxi-column dataField="sensors" caption="Sensors" cellTemplate="sensorTemplate"></dxi-column>
            <dxi-column dataField="lastDataAt" caption="Cập nhật" dataType="datetime" format="dd/MM/yyyy HH:mm"></dxi-column>
            <dxi-column type="buttons" caption="Action" [width]="60" cellTemplate="actionTemplate"></dxi-column>

            <div *dxTemplate="let cell of 'codeTemplate'" class="code">{{ cell.value }}</div>
            <div *dxTemplate="let cell of 'nameTemplate'" class="name">{{ cell.value }}</div>
            <div *dxTemplate="let cell of 'typeTemplate'">
              <span class="tbadge" [ngClass]="'t-' + cell.value">{{ typeLbl(cell.value) }}</span>
            </div>
            <div *dxTemplate="let cell of 'statusTemplate'">
              <span class="sbadge" [ngClass]="cell.value"><i class="fas fa-circle"></i>{{ statusLbl(cell.value) }}</span>
            </div>
            <div *dxTemplate="let cell of 'sensorTemplate'" class="scnt">{{ cell.value.length }}</div>
            <div *dxTemplate="let cell of 'actionTemplate'">
              <button class="abtn" (click)="$event.stopPropagation(); navToDetail(cell.data.id)"><i class="fas fa-eye"></i></button>
            </div>
          </dx-data-grid>
        </div>
        <div class="side-panel">
          <div class="map-box">
            <h4><i class="fas fa-map"></i> Vị trí trạm</h4>
            <div id="stMap" style="height:220px; border-radius:10px"></div>
          </div>
          <div class="detail-box" *ngIf="sel">
            <h4>{{sel.name}}</h4>
            <div class="dgrid">
              <div *ngFor="let item of getDetails(sel)" class="di">
                <span class="dl">{{item[0]}}</span>{{item[1]}}
              </div>
            </div>
            <h5>Sensors ({{sel.sensors.length}})</h5>
            <div class="schips">
              <span *ngFor="let sn of sel.sensors.slice(0,6)" class="schip">
                <i class="fas fa-circle" [ngClass]="sn.status"></i>{{sn.type}}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-bg" *ngIf="showAdd" (click)="closeAdd()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="mhdr">
            <h2>Thêm trạm mới</h2>
            <button (click)="closeAdd()"><i class="fas fa-times"></i></button>
          </div>
          <div class="mbody">
            <div class="frow">
              <div class="fg"><label>Mã trạm</label><input [(ngModel)]="newStation.code" placeholder="VD: HK-02" /></div>
              <div class="fg"><label>Tên trạm</label><input [(ngModel)]="newStation.name" placeholder="Tên trạm" /></div>
            </div>
            <div class="frow">
              <div class="fg">
                <label>Quận/Huyện</label>
                <select [(ngModel)]="newStation.district">
                  <option *ngFor="let d of districts">{{d}}</option>
                </select>
              </div>
              <div class="fg">
                <label>Loại</label>
                <select [(ngModel)]="newStation.type">
                  <option value="fixed">Cố định</option>
                  <option value="mobile">Di động</option>
                  <option value="satellite">Vệ tinh</option>
                </select>
              </div>
            </div>
            <div class="fg"><label>Địa chỉ</label><input [(ngModel)]="newStation.address" placeholder="Địa chỉ đặt trạm" /></div>
            <div class="frow">
              <div class="fg"><label>Vĩ độ</label><input type="number" [(ngModel)]="newStation.latitude" placeholder="21.0285" /></div>
              <div class="fg"><label>Kinh độ</label><input type="number" [(ngModel)]="newStation.longitude" placeholder="105.8542" /></div>
            </div>
            <p class="hint"><i class="fas fa-info-circle"></i> Click trên bản đồ để chọn tọa độ nhanh.</p>
            <div id="addMap" style="height: 200px; border-radius: 8px; margin-top: 10px; border: 1px solid #334155;"></div>
            <p class="hint"><i class="fas fa-info-circle"></i> MQTT topic tự động: hn/station/{{ newStation.code || '[id]' }}/data</p>
          </div>
          <div class="mftr">
            <button class="btn-outline" (click)="closeAdd()">Hủy</button>
            <button class="btn-primary" (click)="saveStation()">Lưu</button>
          </div>
        </div>
      </div>

      <div class="modal-bg" *ngIf="showImport" (click)="showImport=false">
        <div class="modal import-modal" (click)="$event.stopPropagation()">
          <div class="mhdr">
            <h2><i class="fas fa-upload"></i> Nhập thiết bị hàng loạt</h2>
            <button (click)="showImport=false"><i class="fas fa-times"></i></button>
          </div>
          <div class="mbody">
            <p class="desc">Tải lên file Excel (.xlsx) chứa danh sách trạm và sensor để import tự động. Sử dụng <a href="#" style="color:#38bdf8">Template Mẫu</a> nếu chưa có.</p>
            <div class="upload-zone">
              <dx-file-uploader
                #fileUploader
                selectButtonText="Chọn File Excel"
                labelText="hoặc kéo thả file vào đây"
                accept=".csv, .xlsx, .xls"
                uploadMode="useButtons"
                [allowedFileExtensions]="['.csv', '.xlsx', '.xls']"
                [multiple]="false"
                (onValueChanged)="onFileSelected($event)"
                (onUploaded)="importData()">
              </dx-file-uploader>
            </div>
            <div *ngIf="isUploading && importProgress >= 0" class="progress-bar">
              <div class="fill" [style.width]="importProgress + '%'"></div>
              <span>{{ importProgress }}%</span>
            </div>
            
            <div style="margin-top:20px; text-align:right" *ngIf="selectedFile && !isUploading">
              <button class="btn-primary" (click)="importData()"><i class="fas fa-play"></i> Bắt đầu Import</button>
            </div>
          </div>
        </div>
      </div>
    </div>`,
  styles: [`
    .pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:10px}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px}.btn-outline{background:rgba(30,41,59,.8);border:1px solid #334155;color:#94a3b8;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px}
    .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.kc{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:14px}.ki{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px}.bg-blue{background:rgba(56,189,248,.1);color:#38bdf8}.bg-green{background:rgba(34,197,94,.1);color:#22c55e}.bg-red{background:rgba(239,68,68,.1);color:#ef4444}.bg-yellow{background:rgba(234,179,8,.1);color:#eab308}.kc b{font-family:'Outfit';font-size:24px;font-weight:700;color:#f1f5f9;display:block;line-height:1}.kc span{font-size:11px;color:#64748b}
    .split{display:grid;grid-template-columns:1fr 320px;gap:16px}.tbl-wrap{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;overflow:hidden;padding:10px}
    ::ng-deep .dx-datagrid{color:#cbd5e1;font-family:'DM Sans';background:transparent} ::ng-deep .dx-datagrid-headers{background:rgba(15,23,42,.5);color:#64748b} ::ng-deep .dx-datagrid-rowsview .dx-row{border-bottom:1px solid rgba(51,65,85,.3)} ::ng-deep .dx-datagrid-borders > .dx-datagrid-headers, ::ng-deep .dx-datagrid-borders > .dx-datagrid-rowsview{border:none} ::ng-deep .dx-datagrid-filter-row{background:rgba(15,23,42,.3)}
    ::ng-deep .dx-texteditor.dx-editor-outlined{background:rgba(15,23,42,.6);border:1px solid #334155} ::ng-deep .dx-editor-outlined.dx-texteditor-with-label .dx-texteditor-input{color:#e2e8f0}
    ::ng-deep .dx-row-focused.dx-data-row > td:not(.dx-focused), ::ng-deep .dx-row-focused.dx-data-row > tr > td:not(.dx-focused){background-color:rgba(56,189,248,.15)} ::ng-deep .dx-data-row.dx-state-hover:not(.dx-selection):not(.dx-row-inserted):not(.dx-row-removed):not(.dx-edit-row) > td:not(.dx-focused){background-color:rgba(56,189,248,.05)}
    .code{font-family:'JetBrains Mono';font-size:11px;color:#38bdf8}.name{font-weight:600;color:#e2e8f0}
    .tbadge{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600}.t-fixed{background:rgba(56,189,248,.1);color:#38bdf8}.t-mobile{background:rgba(139,92,246,.1);color:#a78bfa}.t-satellite{background:rgba(236,72,153,.1);color:#ec4899}
    .sbadge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600}.sbadge i{font-size:6px}.sbadge.online{color:#22c55e}.sbadge.offline{color:#ef4444}.sbadge.maintenance{color:#eab308}.scnt{font-family:'Outfit';font-weight:700;color:#a78bfa}
    .abtn{background:none;border:1px solid #334155;color:#94a3b8;width:28px;height:28px;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px}.abtn:hover{color:#38bdf8;border-color:#38bdf8}
    .side-panel{display:flex;flex-direction:column;gap:12px}.map-box,.detail-box{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:14px}.map-box h4,.detail-box h4{font-family:'Outfit';font-size:13px;color:#e2e8f0;margin-bottom:10px;display:flex;align-items:center;gap:6px}.map-box h4 i{color:#38bdf8}
    .dgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.di{background:rgba(15,23,42,.5);padding:7px 10px;border-radius:7px;font-size:11px;color:#e2e8f0}.dl{display:block;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:1px}
    .detail-box h5{font-size:12px;color:#94a3b8;margin:12px 0 6px;padding-top:10px;border-top:1px solid rgba(51,65,85,.3)}.schips{display:flex;flex-wrap:wrap;gap:4px}.schip{display:flex;align-items:center;gap:4px;background:rgba(15,23,42,.5);padding:4px 8px;border-radius:6px;font-size:10px;color:#cbd5e1}.schip i{font-size:5px}.schip i.active{color:#22c55e}.schip i.inactive{color:#64748b}
    .mhdr h2{font-family:'Outfit';font-size:17px;color:#f1f5f9;display:flex;align-items:center;gap:8px}.mhdr h2 i{color:#38bdf8}.mhdr button{background:none;border:none;color:#64748b;font-size:16px;cursor:pointer}.mbody{padding:22px}.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fg{margin-bottom:12px}.fg label{display:block;font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:5px}.fg input,.fg select{width:100%;background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:9px;font-size:13px;outline:none}.hint{font-size:11px;color:#64748b;display:flex;align-items:center;gap:6px;margin-top:6px}.hint i{color:#38bdf8}.mftr{display:flex;justify-content:flex-end;gap:8px;padding:14px 22px;border-top:1px solid #334155}
    .import-modal{width:480px}.desc{font-size:13px;color:#94a3b8;line-height:1.5;margin-bottom:20px}.upload-zone{background:rgba(15,23,42,.4);border:1px dashed rgba(56,189,248,.4);border-radius:12px;padding:20px;text-align:center}
    ::ng-deep .dx-fileuploader-button{background:rgba(56,189,248,.1)!important;color:#38bdf8!important;border:1px solid rgba(56,189,248,.3)!important;border-radius:8px!important}::ng-deep .dx-fileuploader-button:hover{background:rgba(56,189,248,.2)!important}::ng-deep .dx-fileuploader-wrapper{color:#e2e8f0!important;font-family:'DM Sans'!important}
    .progress-bar{height:6px;background:rgba(15,23,42,.6);border-radius:3px;margin-top:16px;position:relative;overflow:hidden}.progress-bar .fill{height:100%;background:#22c55e;transition:width .3s}.progress-bar span{position:absolute;top:-20px;right:0;font-size:11px;color:#cbd5e1}
    @media(max-width:1100px){.split{grid-template-columns:1fr}.side-panel{display:none}}@media(max-width:768px){.kpi-row{grid-template-columns:1fr 1fr}}
  `]
})
export class StationsListComponent implements OnInit, AfterViewInit {
  stations: Station[] = []; filtered: Station[] = []; paged: Station[] = []; sel: Station | null = null; districts = DISTRICTS;
  search = ''; fDistrict = ''; fStatus = ''; pg = 1; pageSize = 8; totalPg = 1; pages: number[] = []; startI = 0; endI = 0;
  onlineCount = 0; offlineCount = 0; maintCount = 0; showAdd = false; showImport = false;

  importProgress = 0;
  isUploading = false;
  selectedFile: File | null = null;

  newStation: Partial<Station> = { type: 'fixed', latitude: 21.0285, longitude: 105.8542 };
  private map: L.Map | null = null;
  private addMap: L.Map | null = null;
  private addMarker: L.Marker | null = null;

  constructor(private svc: StationService, private exportSvc: ExportService, private router: Router, private uploadSvc: UploadService) { }
  ngOnInit() { this.svc.getStations().subscribe(s => { this.stations = s; this.onlineCount = s.filter(x => x.status === 'online').length; this.offlineCount = s.filter(x => x.status === 'offline').length; this.maintCount = s.filter(x => x.status === 'maintenance').length; this.filter(); }) }
  ngAfterViewInit() { setTimeout(() => { this.map = L.map('stMap', { zoomControl: false }).setView([21.03, 105.84], 10); L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(this.map); this.stations.forEach(s => { const c = s.status === 'online' ? '#22c55e' : s.status === 'offline' ? '#ef4444' : '#eab308'; L.circleMarker([s.latitude, s.longitude], { radius: 5, fillColor: c, color: c, fillOpacity: .8, weight: 1 }).addTo(this.map!).on('click', () => { this.sel = s; }) }); }, 300) }
  filter() { let r = [...this.stations]; const q = this.search.toLowerCase(); if (q) r = r.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); if (this.fDistrict) r = r.filter(s => s.district === this.fDistrict); if (this.fStatus) r = r.filter(s => s.status === this.fStatus); this.filtered = r; this.pg = 1; this.paginate(); }
  paginate() { this.totalPg = Math.ceil(this.filtered.length / this.pageSize) || 1; this.startI = (this.pg - 1) * this.pageSize; this.endI = Math.min(this.startI + this.pageSize, this.filtered.length); this.paged = this.filtered.slice(this.startI, this.endI); this.pages = Array.from({ length: this.totalPg }, (_, i) => i + 1); }
  typeLbl(t: string) { return { fixed: 'Cố định', mobile: 'Di động', satellite: 'Vệ tinh' }[t] || t }
  statusLbl(s: string) { return { online: 'Online', offline: 'Offline', maintenance: 'Bảo trì' }[s] || s }
  getDetails(s: Station) { return [['Mã', s.code], ['Quận', s.district], ['Loại', this.typeLbl(s.type)], ['Đơn vị', s.managedBy], ['MQTT', s.mqttTopic], ['Lắp đặt', s.installedDate]] }

  onExporting() {
    // Triggers the built-in DevExtreme export functionality programmatically
    // By simulating a click on the grid export button or directly calling grid instance method
    const exportBtn = document.querySelector('.dx-datagrid-export-button');
    if (exportBtn) {
      (exportBtn as HTMLElement).click();
    }
  }

  onExportingGrid(e: any) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Danh Sách Trạm');

    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      autoFilterEnabled: true
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `TramQuanTrac_${new Date().getTime()}.xlsx`);
      });
    });
    e.cancel = true; // Prevent default export
  }

  onFocusedRowChanged(e: any) {
    if (e.row && e.row.data) {
      this.sel = e.row.data;
    }
  }

  navToDetail(id: string) {
    this.router.navigate(['/monitoring/station', id]);
  }

  openAdd() {
    this.showAdd = true;
    this.newStation = { type: 'fixed', latitude: 21.0285, longitude: 105.8542 };
    setTimeout(() => {
      this.addMap = L.map('addMap').setView([21.0285, 105.8542], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(this.addMap);
      this.addMarker = L.marker([21.0285, 105.8542], { draggable: true }).addTo(this.addMap);

      this.addMap.on('click', (e: L.LeafletMouseEvent) => {
        const lat = parseFloat(e.latlng.lat.toFixed(4));
        const lng = parseFloat(e.latlng.lng.toFixed(4));
        this.newStation.latitude = lat;
        this.newStation.longitude = lng;
        this.addMarker?.setLatLng(e.latlng);
      });

      this.addMarker.on('dragend', () => {
        const pos = this.addMarker?.getLatLng();
        if (pos) {
          this.newStation.latitude = parseFloat(pos.lat.toFixed(4));
          this.newStation.longitude = parseFloat(pos.lng.toFixed(4));
        }
      });
      // Fix leaflet tile rendering issue in modals
      setTimeout(() => this.addMap?.invalidateSize(), 100);
    }, 100);
  }

  closeAdd() {
    this.showAdd = false;
    if (this.addMap) {
      this.addMap.remove();
      this.addMap = null;
    }
  }

  saveStation() {
    console.log('Saved station:', this.newStation);
    this.closeAdd();
    // Simulate save success
    // Refresh list logic would go here
  }

  onFileSelected(e: any) {
    const file = e.value[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  importData() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.importProgress = 0;

    this.uploadSvc.uploadMock(this.selectedFile).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.importProgress = Math.round(100 * event.loaded / event.total);
          }
        } else if (event.type === HttpEventType.Response) {
          // Xong
          setTimeout(() => {
            this.showImport = false;
            this.isUploading = false;
            this.importProgress = 0;
            this.selectedFile = null;
            // Optionally clear uploader
            alert('Import dữ liệu thiết bị thành công!');
          }, 500);
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.isUploading = false;
        alert('Có lỗi xảy ra khi upload!');
      }
    });
  }
}
