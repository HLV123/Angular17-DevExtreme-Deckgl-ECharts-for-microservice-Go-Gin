import { Component } from '@angular/core'; import { CommonModule } from '@angular/common'; import { MOCK_ML_MODELS } from '../../../core/mock-data/others.mock'; import { MlModel } from '../../../core/models';
import { DxFileUploaderModule } from 'devextreme-angular';
import { CorrelationMatrixComponent } from '../../../shared/components/charts/correlation-matrix/correlation-matrix.component';

@Component({
  selector: 'app-forecast-models', standalone: true, imports: [CommonModule, DxFileUploaderModule, CorrelationMatrixComponent],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-project-diagram"></i> Quản lý Mô hình ML</h1><p>{{models.length}} mô hình đã huấn luyện</p></div><div class="hdr-acts"><button class="btn-primary" (click)="showUpload=true"><i class="fas fa-upload"></i> Upload Mô hình</button></div></div>
    <div class="models-grid"><div *ngFor="let m of models" class="model-card" [class.active-model]="m.status==='active'">
      <div class="mc-top"><span class="algo-badge">{{m.algorithm}}</span><span class="status-pill" [ngClass]="m.status">{{m.status==='active'?'Hoạt động':m.status==='training'?'Đang train':'Tắt'}}</span></div>
      <h3>{{m.name}}</h3><p class="mc-desc">{{m.description}}</p>
      <div class="metrics"><div class="metric"><span class="mv">{{m.metrics.rmse}}</span><span class="ml">RMSE</span></div><div class="metric"><span class="mv">{{m.metrics.mae}}</span><span class="ml">MAE</span></div><div class="metric"><span class="mv">{{m.metrics.r2}}</span><span class="ml">R²</span></div><div class="metric"><span class="mv">{{m.metrics.mape}}%</span><span class="ml">MAPE</span></div></div>
      <div class="mc-meta"><span><i class="fas fa-calendar"></i> {{m.trainedAt}}</span><span><i class="fas fa-database"></i> {{m.trainingDataRange}}</span></div>
      <div class="mc-features"><span *ngFor="let f of m.features" class="ftag">{{f}}</span></div>
      <div class="mc-actions"><button class="abtn"><i class="fas fa-play"></i> Chạy dự báo</button><button class="abtn outline"><i class="fas fa-redo"></i> Retrain</button></div>
    </div></div>
    
    <div class="feature-engineering-section" style="margin-top: 32px;">
      <div class="pg-hdr">
        <div>
          <h2><i class="fas fa-chart-network"></i> Feature Engineering (D3.js)</h2>
          <p>Mức độ tương quan giữa các thông số ô nhiễm và thời tiết (Correlation Matrix)</p>
        </div>
      </div>
      <div class="correlation-card" style="background: rgba(30,41,59,0.6); border: 1px solid rgba(51,65,85,0.4); border-radius: 16px; padding: 20px; height: 500px">
        <app-correlation-matrix></app-correlation-matrix>
      </div>
    </div>
    
    <div class="modal-bg" *ngIf="showUpload" (click)="showUpload=false">
      <div class="modal import-modal" (click)="$event.stopPropagation()">
        <div class="mhdr"><h2><i class="fas fa-upload"></i> Upload Mô hình ML</h2><button (click)="showUpload=false"><i class="fas fa-times"></i></button></div>
        <div class="mbody">
          <p class="desc">Chỉ chấp nhận các file mô hình định dạng Pickle (.pkl) hoặc ONNX (.onnx). Kích thước tối đa 50MB.</p>
          <div class="upload-zone">
            <dx-file-uploader
              selectButtonText="Chọn file mô hình"
              labelText="hoặc kéo thả file vào đây"
              accept=".pkl, .onnx"
              uploadMode="useButtons"
              [allowedFileExtensions]="['.pkl', '.onnx']"
              (onUploaded)="importModel($event)">
            </dx-file-uploader>
          </div>
          <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="progress-bar">
            <div class="fill" [style.width]="uploadProgress + '%'"></div>
            <span>{{uploadProgress}}%</span>
          </div>
        </div>
      </div>
    </div>
    </div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:10px}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px}
    .models-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px}
    .model-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px;transition:all .2s}.model-card:hover{border-color:rgba(56,189,248,.3)}.active-model{border-left:3px solid #22c55e}
    .mc-top{display:flex;justify-content:space-between;margin-bottom:10px}.algo-badge{background:rgba(139,92,246,.15);color:#a78bfa;padding:4px 12px;border-radius:8px;font-size:11px;font-weight:700}.status-pill{padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600}.status-pill.active{background:rgba(34,197,94,.1);color:#22c55e}.status-pill.inactive{background:rgba(100,116,139,.1);color:#64748b}.status-pill.training{background:rgba(234,179,8,.1);color:#eab308}
    .model-card h3{font-family:'Outfit';font-size:16px;color:#f1f5f9;margin-bottom:6px}.mc-desc{font-size:13px;color:#94a3b8;margin-bottom:14px}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.metric{background:rgba(15,23,42,.5);padding:10px;border-radius:10px;text-align:center}.mv{display:block;font-family:'Outfit';font-size:18px;font-weight:700;color:#38bdf8}.ml{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
    .mc-meta{display:flex;gap:16px;font-size:12px;color:#64748b;margin-bottom:10px}.mc-meta i{margin-right:4px}
    .mc-features{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px}.ftag{background:rgba(51,65,85,.4);color:#94a3b8;padding:3px 8px;border-radius:6px;font-size:10px}
    .mc-actions{display:flex;gap:8px}.abtn{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.3);color:#38bdf8;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;transition:all .2s}.abtn:hover{background:rgba(56,189,248,.2)}.abtn.outline{background:transparent;border-color:#334155;color:#94a3b8}.abtn.outline:hover{border-color:#a78bfa;color:#a78bfa}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center}.modal{background:#1e293b;border:1px solid #334155;border-radius:18px;width:560px;max-height:90vh;overflow-y:auto}.mhdr{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #334155}.mhdr h2{font-family:'Outfit';font-size:17px;color:#f1f5f9;display:flex;align-items:center;gap:8px}.mhdr h2 i{color:#38bdf8}.mhdr button{background:none;border:none;color:#64748b;font-size:16px;cursor:pointer}.mbody{padding:22px}
    .import-modal{width:480px}.desc{font-size:13px;color:#94a3b8;line-height:1.5;margin-bottom:20px}.upload-zone{background:rgba(15,23,42,.4);border:1px dashed rgba(56,189,248,.4);border-radius:12px;padding:20px;text-align:center}
    ::ng-deep .dx-fileuploader-button{background:rgba(56,189,248,.1)!important;color:#38bdf8!important;border:1px solid rgba(56,189,248,.3)!important;border-radius:8px!important}::ng-deep .dx-fileuploader-button:hover{background:rgba(56,189,248,.2)!important}::ng-deep .dx-fileuploader-wrapper{color:#e2e8f0!important;font-family:'DM Sans'!important}
    .progress-bar{height:6px;background:rgba(15,23,42,.6);border-radius:3px;margin-top:16px;position:relative;overflow:hidden}.progress-bar .fill{height:100%;background:#22c55e;transition:width .3s}.progress-bar span{position:absolute;top:-20px;right:0;font-size:11px;color:#cbd5e1}`]
})
export class ForecastModelsComponent {
  models: MlModel[] = MOCK_ML_MODELS;
  showUpload = false;
  uploadProgress = 0;

  importModel(e: any) {
    this.uploadProgress = 10;
    const interval = setInterval(() => {
      this.uploadProgress += 20;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.showUpload = false;
          this.uploadProgress = 0;
          alert('Upload mô hình thành công và đã thêm vào danh sách quản lý!');
        }, 500);
      }
    }, 400);
  }
}
