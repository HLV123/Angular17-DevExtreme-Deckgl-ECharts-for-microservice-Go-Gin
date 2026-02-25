import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../core/services/upload.service';
import { DxFileUploaderModule, DxDataGridModule } from 'devextreme-angular';
import { HttpEventType } from '@angular/common/http';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-data-import',
  standalone: true,
  imports: [CommonModule, DxFileUploaderModule, DxDataGridModule],
  template: `
    <div class="page animate-fade-in">
      <div class="pg-hdr">
        <div>
          <h1><i class="fas fa-file-import"></i> Nhập Dữ Liệu Lịch Sử</h1>
          <p>Tải lên file CSV hoặc Excel để bổ sung dữ liệu quá khứ cho hệ thống</p>
        </div>
      </div>

      <div class="import-card">
        <div class="step-lbl">1. Chọn tập tin</div>
        <div class="upload-zone">
          <dx-file-uploader
            #fileUploader
            selectButtonText="Chọn File Dữ Liệu"
            labelText="hoặc kéo thả file vào đây"
            accept=".csv, .xlsx, .xls"
            uploadMode="useButtons"
            [allowedFileExtensions]="['.csv', '.xlsx', '.xls']"
            [multiple]="false"
            (onValueChanged)="onFileSelected($event)">
          </dx-file-uploader>
        </div>

        <div *ngIf="previewData.length > 0" class="preview-section animate-fade-in">
          <div class="step-lbl">2. Kiểm tra dữ liệu ({{previewData.length}} dòng đầu)</div>
          <dx-data-grid
            [dataSource]="previewData"
            [showBorders]="true"
            [rowAlternationEnabled]="true"
            [columnAutoWidth]="true">
            <dxo-scrolling mode="virtual"></dxo-scrolling>
          </dx-data-grid>
        </div>

        <div *ngIf="isUploading" class="progress-section animate-fade-in">
          <div class="step-lbl">Đang xử lý ({{uploadProgress}}%)</div>
          <div class="progress-bar">
            <div class="fill" [style.width]="uploadProgress + '%'"></div>
          </div>
        </div>

        <div class="actions" *ngIf="previewData.length > 0 && !isUploading">
          <button class="btn-primary" (click)="importData()"><i class="fas fa-cloud-upload-alt"></i> Xác nhận & Import</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.pg-hdr h1{font-family:'Outfit';font-size:24px;color:#f1f5f9;display:flex;align-items:center;gap:12px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#94a3b8;font-size:14px;margin-top:6px}
    .import-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:30px;max-width:900px}
    .step-lbl{font-family:'Outfit';font-size:16px;font-weight:600;color:#e2e8f0;margin-bottom:16px;display:flex;align-items:center;gap:8px}
    .upload-zone{background:rgba(15,23,42,.4);border:2px dashed rgba(56,189,248,.3);border-radius:12px;padding:30px;text-align:center;transition:border-color .3s}.upload-zone:hover{border-color:rgba(56,189,248,.6)}
    
    ::ng-deep .dx-fileuploader-button{background:linear-gradient(135deg,#0ea5e9,#22c55e)!important;color:#fff!important;border:none!important;border-radius:10px!important;padding:10px 20px!important;font-weight:600!important}
    ::ng-deep .dx-fileuploader-wrapper{color:#e2e8f0!important;font-family:'DM Sans'!important}
    
    .preview-section{margin-top:30px;border-top:1px solid rgba(51,65,85,.4);padding-top:30px}
    ::ng-deep .dx-datagrid{color:#cbd5e1;font-family:'DM Sans';background:transparent} ::ng-deep .dx-datagrid-headers{background:rgba(15,23,42,.5);color:#94a3b8} ::ng-deep .dx-datagrid-rowsview .dx-row{border-bottom:1px solid rgba(51,65,85,.3)} ::ng-deep .dx-datagrid-borders > .dx-datagrid-headers, ::ng-deep .dx-datagrid-borders > .dx-datagrid-rowsview{border:none}
    
    .progress-section{margin-top:20px}.progress-bar{height:10px;background:rgba(15,23,42,.6);border-radius:5px;overflow:hidden}.progress-bar .fill{height:100%;background:linear-gradient(90deg,#0ea5e9,#22c55e);transition:width .3s}
    .actions{margin-top:30px;display:flex;justify-content:flex-end}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:8px;transition:opacity .2s;box-shadow:0 4px 15px rgba(14,165,233,.2)}.btn-primary:hover{opacity:.9}
  `]
})
export class DataImportComponent {
  selectedFile: File | null = null;
  previewData: any[] = [];
  isUploading = false;
  uploadProgress = 0;

  constructor(private uploadSvc: UploadService) { }

  onFileSelected(e: any) {
    const file = e.value[0];
    if (file) {
      this.selectedFile = file;
      this.previewFile(file);
    } else {
      this.selectedFile = null;
      this.previewData = [];
    }
  }

  previewFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (jsonData.length > 1) {
        const headers: any = jsonData[0];
        const rows = jsonData.slice(1, 11); // Preview max 10 rows

        this.previewData = rows.map((row: any) => {
          const obj: any = {};
          headers.forEach((h: string, i: number) => {
            obj[h || `Col${i}`] = row[i];
          });
          return obj;
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  importData() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.uploadSvc.uploadMock(this.selectedFile).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
        } else if (event.type === HttpEventType.Response) {
          setTimeout(() => {
            this.isUploading = false;
            this.uploadProgress = 0;
            this.selectedFile = null;
            this.previewData = [];
            alert('Import dữ liệu thành công!');
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

