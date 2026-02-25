import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_REPORTS } from '../../../core/mock-data/others.mock';
import { DxFormModule, DxButtonModule, DxSelectBoxModule, DxDateBoxModule, DxCheckBoxModule, DxTagBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-analytics-reports', standalone: true,
  imports: [CommonModule, FormsModule, DxFormModule, DxButtonModule, DxSelectBoxModule, DxDateBoxModule, DxCheckBoxModule, DxTagBoxModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><h1><i class="fas fa-file-alt text-slate-400"></i> Báo cáo & Phân tích</h1><p>{{reports.length}} báo cáo · Tự động và tùy chỉnh</p></div>
    <div class="rpt-grid"><div *ngFor="let r of reports" class="rpt-card">
      <div class="rpt-top"><i class="fas" [ngClass]="iconFor(r.type)"></i><span class="rpt-type">{{typeLbl(r.type)}}</span><span class="rpt-status" [ngClass]="r.status">{{r.status==='ready'?'Sẵn sàng':'Đang tạo'}}</span></div>
      <h3>{{r.title}}</h3><p class="rpt-desc">{{r.format}}</p>
      <div class="rpt-meta"><span><i class="fas fa-calendar"></i> {{r.period}}</span><span><i class="fas fa-clock"></i> {{fmt(r.generatedAt)}}</span></div>
      <div class="rpt-actions">
        <button class="abtn" (click)="downloadPdf(r)"><i class="fas fa-file-pdf"></i> PDF</button>
        <button class="abtn"><i class="fas fa-file-excel"></i> Excel</button>
        <button class="abtn"><i class="fas fa-eye"></i> Xem</button>
      </div>
    </div></div>
    
    <div class="builder-card" *ngIf="!showBuilder">
      <h3><i class="fas fa-plus-circle"></i> Tạo Báo cáo Tùy chỉnh</h3>
      <p>Chọn khoảng thời gian, trạm, chỉ tiêu và loại biểu đồ để tạo báo cáo ad-hoc. Preview trước khi xuất PDF/Excel.</p>
      <button class="btn-primary" (click)="showBuilder=true"><i class="fas fa-magic"></i> Tạo báo cáo mới</button>
    </div>

    <div class="builder-form-card" *ngIf="showBuilder">
      <div class="mhdr">
        <h3><i class="fas fa-magic"></i> Builder Báo Cáo Tùy Chỉnh</h3>
        <button class="abtn" (click)="showBuilder=false" [disabled]="isExporting"><i class="fas fa-times"></i></button>
      </div>
      
      <!-- Stepper UI -->
      <div class="stepper">
        <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
          <div class="circle">1</div><div class="label">Cơ bản</div>
        </div>
        <div class="line"></div>
        <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
          <div class="circle">2</div><div class="label">Phạm vi</div>
        </div>
        <div class="line"></div>
        <div class="step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
          <div class="circle">3</div><div class="label">Hiển thị</div>
        </div>
      </div>

      <!-- Step 1: Basic Info -->
      <div class="dx-fieldset step-content" *ngIf="currentStep === 1">
        <dx-form id="form1" [formData]="reportData" labelLocation="top">
          <dxi-item itemType="group">
            <dxi-item dataField="title" [editorOptions]="{ placeholder: 'Ví dụ: Báo cáo chất lượng không khí Quý 1/2025' }">
              <dxo-label text="Tiêu đề Báo cáo"></dxo-label>
              <dxi-validation-rule type="required" message="Vui lòng nhập tiêu đề"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="desc" editorType="dxTextArea" [editorOptions]="{ height: 90, placeholder: 'Mô tả ngắn gọn mục đích báo cáo...' }">
              <dxo-label text="Mô tả"></dxo-label>
            </dxi-item>
            <dxi-item dataField="type" editorType="dxSelectBox" [editorOptions]="{ items: ['Chất lượng KK Tổng hợp', 'Điểm nóng Ô nhiễm', 'Sự cố & Cảnh báo', 'Tùy chỉnh'] }">
              <dxo-label text="Mẫu báo cáo"></dxo-label>
            </dxi-item>
          </dxi-item>
        </dx-form>
      </div>

      <!-- Step 2: Scope -->
      <div class="dx-fieldset step-content" *ngIf="currentStep === 2">
        <dx-form id="form2" [formData]="reportData" labelLocation="top">
          <dxi-item itemType="group" colCount="2">
            <dxi-item dataField="startDate" editorType="dxDateBox" [editorOptions]="{ type: 'date', displayFormat: 'dd/MM/yyyy' }"><dxo-label text="Từ ngày"></dxo-label></dxi-item>
            <dxi-item dataField="endDate" editorType="dxDateBox" [editorOptions]="{ type: 'date', displayFormat: 'dd/MM/yyyy' }"><dxo-label text="Đến ngày"></dxo-label></dxi-item>
            <dxi-item dataField="station" editorType="dxSelectBox" [editorOptions]="{ items: ['Tất cả (Toàn TP)', 'Khu vực Nội thành', 'Các KCN', 'Trạm Hoàn Kiếm', 'Trạm Cầu Giấy'] }"><dxo-label text="Phạm vi Trạm"></dxo-label></dxi-item>
            <dxi-item dataField="pollutants" editorType="dxTagBox" [editorOptions]="{ items: ['AQI', 'PM2.5', 'PM10', 'CO', 'NO2', 'SO2', 'O3'], value: ['AQI', 'PM2.5'] }"><dxo-label text="Chỉ tiêu xuất"></dxo-label></dxi-item>
          </dxi-item>
        </dx-form>
      </div>

      <!-- Step 3: Format -->
      <div class="dx-fieldset step-content" *ngIf="currentStep === 3">
        <dx-form id="form3" [formData]="reportData" labelLocation="top">
          <dxi-item itemType="group">
            <dxi-item dataField="includeCharts" editorType="dxCheckBox" [editorOptions]="{ text: 'Bao gồm Biểu đồ Xu hướng' }"><dxo-label [visible]="false"></dxo-label></dxi-item>
            <dxi-item dataField="includeRawData" editorType="dxCheckBox" [editorOptions]="{ text: 'Đính kèm dữ liệu thô (raw data)' }"><dxo-label [visible]="false"></dxo-label></dxi-item>
            <dxi-item dataField="format" editorType="dxSelectBox" [editorOptions]="{ items: ['Chỉ PDF', 'Chỉ Excel', 'Cả PDF và Excel'] }"><dxo-label text="Định dạng xuất"></dxo-label></dxi-item>
          </dxi-item>
        </dx-form>
        <div class="preview-box">
          <div class="prev-icon"><i class="fas fa-file-pdf"></i></div>
          <div class="prev-info">
            <h4>Bản xem trước sẵn sàng</h4>
            <p>Báo cáo "<b>{{reportData.title || 'Chưa đặt tên'}}</b>" sẽ được tổng hợp từ {{reportData.startDate | date:'dd/MM/yyyy'}} đến {{reportData.endDate | date:'dd/MM/yyyy'}} tại {{reportData.station}}.</p>
          </div>
        </div>
      </div>
      <div class="mftr">
        <dx-button text="Hủy" type="normal" (onClick)="showBuilder=false" [disabled]="isExporting"></dx-button>
        <div style="flex:1"></div>
        <dx-button *ngIf="currentStep > 1" text="Quay lại" type="normal" (onClick)="prevStep()" [disabled]="isExporting"></dx-button>
        <dx-button *ngIf="currentStep < 3" text="Tiếp tục" type="default" (onClick)="nextStep()"></dx-button>
        <dx-button *ngIf="currentStep === 3" [text]="isExporting ? 'Đang xuất...' : 'Tạo & Xuất'" type="default" icon="check" (onClick)="generateReport()" [disabled]="isExporting"></dx-button>
      </div>
    </div>
    
    <!-- PDF Export Template (Hidden from view) -->
    <div class="pdf-export-container" [class.exporting]="isExporting">
      <div id="pdf-content" class="pdf-content">
        <div class="pdf-header">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background: #0ea5e9; border-radius: 8px;"></div>
            <div>
              <h2 style="margin: 0; color: #1e293b; font-family: sans-serif; font-size: 20px;">Urban Air Platform</h2>
              <p style="margin: 0; color: #64748b; font-size: 12px;">Báo cáo Chất lượng Không khí</p>
            </div>
          </div>
          <h1 style="color: #0f172a; margin-bottom: 10px; font-family: sans-serif;">{{ reportData.title || 'Báo cáo Không tiêu đề' }}</h1>
          <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">{{ reportData.desc }}</p>
        </div>
        
        <div class="pdf-summary" style="display: flex; gap: 20px; margin-bottom: 30px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 15px 0;">
          <div style="flex: 1;">
            <span style="display: block; font-size: 11px; color: #64748b; text-transform: uppercase;">Thời gian</span>
            <strong style="color: #1e293b; font-size: 14px;">{{ reportData.startDate | date:'dd/MM/yyyy' }} - {{ reportData.endDate | date:'dd/MM/yyyy' }}</strong>
          </div>
          <div style="flex: 1;">
            <span style="display: block; font-size: 11px; color: #64748b; text-transform: uppercase;">Khu vực trạm</span>
            <strong style="color: #1e293b; font-size: 14px;">{{ reportData.station }}</strong>
          </div>
          <div style="flex: 1;">
            <span style="display: block; font-size: 11px; color: #64748b; text-transform: uppercase;">Chỉ tiêu</span>
            <strong style="color: #1e293b; font-size: 14px;">{{ (reportData.pollutants || []).join(', ') }}</strong>
          </div>
        </div>
        
        <div class="pdf-body" style="min-height: 400px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <p style="color: #94a3b8; font-style: italic;">(Dữ liệu tổng hợp và biểu đồ sẽ được render tại đây)</p>
        </div>
        
        <div class="pdf-footer" style="margin-top: 40px; text-align: right; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Được tạo tự động bởi Hệ thống Urban Air vào {{ fmt(currentDate.toISOString()) }}
        </div>
      </div>
    </div>
  </div>`,
  styles: [`.pg-hdr{margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .rpt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px;margin-bottom:18px}
    .rpt-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:18px;transition:all .2s}.rpt-card:hover{border-color:rgba(56,189,248,.3)}
    .rpt-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}.rpt-top i{font-size:16px;color:#38bdf8}.rpt-type{font-size:11px;font-weight:700;color:#a78bfa;text-transform:uppercase}.rpt-status{margin-left:auto;padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700}.rpt-status.ready{background:rgba(34,197,94,.1);color:#22c55e}.rpt-status.generating{background:rgba(234,179,8,.1);color:#eab308}
    .rpt-card h3{font-family:'Outfit';font-size:15px;color:#f1f5f9;margin-bottom:6px}.rpt-desc{font-size:13px;color:#94a3b8;margin-bottom:10px}
    .rpt-meta{display:flex;gap:16px;font-size:12px;color:#64748b;margin-bottom:12px}.rpt-meta i{margin-right:4px}
    .rpt-actions{display:flex;gap:6px}.abtn{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;gap:5px;transition:all .2s}.abtn:hover{background:rgba(56,189,248,.15)}
    .abtn:disabled{opacity:0.5;cursor:not-allowed;}
    .builder-card{background:rgba(30,41,59,.6);border:1px dashed rgba(56,189,248,.3);border-radius:14px;padding:24px;text-align:center}.builder-card h3{font-family:'Outfit';font-size:16px;color:#e2e8f0;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:8px}.builder-card h3 i{color:#38bdf8}.builder-card p{font-size:13px;color:#94a3b8;margin-bottom:16px}
    .btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 24px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:8px}
    .builder-form-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:20px;margin-top:20px;}
    .mhdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #334155;padding-bottom:10px;}
    .mhdr h3{font-family:'Outfit';font-size:18px;color:#f1f5f9;display:flex;align-items:center;gap:8px;}
    .mftr{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;border-top:1px solid #334155;padding-top:15px;}
    ::ng-deep .dx-form-group-content{background:transparent !important;}
    ::ng-deep .dx-field-item-label-text{color:#94a3b8 !important; font-size: 13px !important; font-weight: 500;}
    ::ng-deep .dx-texteditor-input{color:#e2e8f0 !important; font-family: 'DM Sans' !important;}
    ::ng-deep .dx-texteditor.dx-editor-outlined{background:rgba(15,23,42,.6) !important;border:1px solid #334155 !important;border-radius:8px !important;}
    
    .stepper { display: flex; align-items: center; justify-content: center; margin-bottom: 30px; padding: 0 40px; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 2; position: relative; }
    .circle { width: 32px; height: 32px; border-radius: 50%; background: #1e293b; border: 2px solid #334155; display: flex; align-items: center; justify-content: center; color: #64748b; font-weight: 700; font-family: 'Outfit'; transition: all 0.3s; }
    .label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s; }
    .line { flex: 1; height: 2px; background: #334155; margin: -20px 0 0 0; z-index: 1; transition: all 0.3s; }
    .step.active .circle { border-color: #38bdf8; color: #38bdf8; background: rgba(56,189,248,.1); }
    .step.active .label { color: #38bdf8; }
    .step.completed .circle { background: #38bdf8; border-color: #38bdf8; color: #fff; }
    .step.completed .label { color: #e2e8f0; }
    .step.completed + .line { background: #38bdf8; }
    .step-content { animation: fadeIn 0.3s ease; min-height: 250px; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    
    .preview-box { display: flex; gap: 16px; align-items: center; background: rgba(56,189,248,.05); border: 1px dashed rgba(56,189,248,.4); border-radius: 12px; padding: 20px; margin-top: 24px; }
    .prev-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(239,68,68,.1); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .prev-info h4 { color: #e2e8f0; font-size: 15px; margin-bottom: 6px; }
    .prev-info p { color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0; }
    .prev-info b { color: #f1f5f9; }
    
    .pdf-export-container { position: absolute; left: -9999px; top: 0; }
    .pdf-export-container.exporting { display: block; }
    .pdf-content { width: 800px; padding: 40px; background: #ffffff; color: #333333; font-family: 'DM Sans', sans-serif; }
  `]
})
export class AnalyticsReportsComponent {
  reports = MOCK_REPORTS;
  showBuilder = false;
  currentStep = 1;
  isExporting = false;
  currentDate = new Date();

  reportData: any = {
    title: '',
    desc: '',
    type: 'Chất lượng KK Tổng hợp',
    startDate: new Date(),
    endDate: new Date(),
    station: 'Tất cả (Toàn TP)',
    pollutants: ['AQI', 'PM2.5'],
    includeCharts: true,
    includeRawData: false,
    format: 'Cả PDF và Excel'
  };

  typeLbl(t: string) { return { daily: 'Ngày', weekly: 'Tuần', monthly: 'Tháng', quarterly: 'Quý', event: 'Sự kiện' }[t] || t }
  iconFor(t: string) { return { daily: 'fa-calendar-day', weekly: 'fa-calendar-week', monthly: 'fa-calendar', quarterly: 'fa-calendar-alt', event: 'fa-exclamation-triangle' }[t] || 'fa-file' }
  fmt(t: string) { return new Date(t).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }

  nextStep() {
    if (this.currentStep === 1 && !this.reportData.title) {
      notify({ message: 'Vui lòng nhập tiêu đề báo cáo', type: 'error', displayTime: 3000 });
      return;
    }
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  generateReport() {
    if (this.reportData.format.includes('PDF')) {
      this.exportPdf();
    } else {
      notify({ message: 'Tính năng xuất Excel đang được cập nhật!', type: 'info', displayTime: 3000 });
      this.resetBuilder();
    }
  }

  downloadPdf(r: any) {
    this.reportData.title = r.title;
    this.reportData.desc = 'Báo cáo mẫu được xuất tự động từ hệ thống theo lịch trình.';
    this.exportPdf();
  }

  exportPdf() {
    this.isExporting = true;
    notify({ message: 'Hệ thống đang tổng hợp dữ liệu và tạo PDF. Vui lòng đợi...', type: 'info', displayTime: 3000 });

    // Give Angular time to render the hidden container with updated data
    setTimeout(async () => {
      const element = document.getElementById('pdf-content');
      if (element) {
        try {
          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('UrbanAir_BaoCao_' + new Date().getTime() + '.pdf');

          notify({ message: 'Xuất PDF thành công!', type: 'success', displayTime: 3000 });
        } catch (error) {
          console.error('Lỗi khi xuất PDF:', error);
          notify({ message: 'Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.', type: 'error', displayTime: 4000 });
        }
      }
      this.resetBuilder();
    }, 500); // Wait half a second before rendering to ensure bindings are applied
  }

  resetBuilder() {
    this.isExporting = false;
    this.showBuilder = false;
    this.currentStep = 1;
    this.reportData.title = '';
    this.reportData.desc = '';
  }
}
