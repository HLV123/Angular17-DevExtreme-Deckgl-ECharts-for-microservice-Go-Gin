import { Component, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { DxFormModule, DxButtonModule, DxFileUploaderModule, DxFormComponent } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-community-submit',
  standalone: true,
  imports: [CommonModule, FormsModule, DxFormModule, DxButtonModule, DxFileUploaderModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="pg-hdr">
        <h1><i class="fas fa-paper-plane text-sky-400"></i> Gửi Phản ánh</h1>
        <p>Góp phần bảo vệ môi trường bằng cách phản ánh các vấn đề ô nhiễm xung quanh bạn</p>
      </div>
      
      <div class="form-wrapper">
        <div class="form-card">
          <h3 style="font-family: 'Outfit'; color: #e2e8f0; margin-bottom: 20px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-edit text-emerald-400"></i> Thông tin Phản ánh
          </h3>
          
          <dx-form #submitForm id="submitForm" [formData]="reportData" labelLocation="top" (onFieldDataChanged)="onFieldChanged($event)">
            <dxi-item itemType="group">
              <dxi-item dataField="type" editorType="dxSelectBox" [editorOptions]="{ items: issueTypes, placeholder: '-- Chọn loại vấn đề --' }">
                <dxo-label text="Loại vấn đề *"></dxo-label>
                <dxi-validation-rule type="required" message="Vui lòng chọn loại vấn đề"></dxi-validation-rule>
              </dxi-item>
              
              <dxi-item dataField="address" [editorOptions]="{ placeholder: 'Click vào bản đồ để chọn tọa độ hoặc nhập địa chỉ...' }">
                <dxo-label text="Địa chỉ / Tọa độ *"></dxo-label>
                <dxi-validation-rule type="required" message="Vui lòng nhập địa chỉ hoặc chọn tọa độ"></dxi-validation-rule>
              </dxi-item>
              
              <dxi-item dataField="desc" editorType="dxTextArea" [editorOptions]="{ height: 100, placeholder: 'Mô tả chi tiết tình trạng ô nhiễm bạn quan sát được...' }">
                <dxo-label text="Mô tả chi tiết *"></dxo-label>
                <dxi-validation-rule type="required" message="Vui lòng mô tả chi tiết"></dxi-validation-rule>
              </dxi-item>
            </dxi-item>
          </dx-form>
          
          <!-- File Uploader -->
          <div class="dx-fieldset" style="margin: 20px 0;">
            <div class="dx-field">
              <div class="dx-field-label" style="color:#94a3b8; font-size:13px; font-weight:500; padding:0; width:auto; margin-bottom:8px; display:block;">Ảnh / Video đính kèm</div>
              <div class="dx-field-value" style="width: 100%; border: 2px dashed rgba(56,189,248,.3); border-radius: 8px; padding: 10px; background: rgba(56,189,248,.03);">
                <dx-file-uploader
                  selectButtonText="Chọn File"
                  labelText="hoặc kéo thả file vào đây"
                  accept="image/*,video/*"
                  uploadMode="useForm">
                </dx-file-uploader>
              </div>
            </div>
          </div>
          
          <!-- Optional Info -->
          <dx-form id="optionalForm" [formData]="reportData" labelLocation="top">
            <dxi-item itemType="group" colCount="2" caption="Thông tin liên hệ (Tùy chọn)">
              <dxi-item dataField="name" [editorOptions]="{ placeholder: 'Họ và tên' }"><dxo-label text="Họ tên"></dxo-label></dxi-item>
              <dxi-item dataField="phone" [editorOptions]="{ placeholder: '0912345678' }"><dxo-label text="Số điện thoại"></dxo-label></dxi-item>
            </dxi-item>
            <dxi-item dataField="anonymous" editorType="dxCheckBox" [editorOptions]="{ text: 'Gửi ẩn danh (bảo mật danh tính)' }">
              <dxo-label [visible]="false"></dxo-label>
            </dxi-item>
          </dx-form>
          
          <!-- Captcha Mock -->
          <div class="captcha-mock" (click)="verifyCaptcha()">
            <div class="cbox" [class.verified]="captchaVerified">
              <i class="fas" [ngClass]="captchaVerified ? 'fa-check text-green' : 'fa-stop'"></i>
            </div>
            <span>Tôi không phải là người máy</span>
            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" height="24" alt="reCAPTCHA">
          </div>

          <dx-button text="Gửi phản ánh" type="default" icon="paper-plane" [disabled]="!captchaVerified || submitted" (onClick)="submit()"></dx-button>
          
          <div class="success-msg" *ngIf="submitted">
            <i class="fas fa-check-circle"></i> Phản ánh đã được gửi thành công! Mã tra cứu: <b>PA-2025-{{code}}</b>
          </div>
        </div>
        
        <div class="map-card border-card">
          <div class="map-head">
            <h3><i class="fas fa-map-marker-alt text-orange-500"></i> Chọn vị trí trên bản đồ</h3>
            <p>Click vào bản đồ để ghim chính xác vị trí phản ánh</p>
          </div>
          <div id="submitMap" class="map-container"></div>
        </div>
      </div>
    </div>
  `,

  styles: [`.pg-hdr{margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .form-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .form-card, .map-card { background: rgba(30,41,59,.6); border: 1px solid rgba(51,65,85,.4); border-radius: 16px; padding: 28px; }
    .map-card { padding: 20px; display: flex; flex-direction: column; }
    .map-head { margin-bottom: 16px; }
    .map-head h3 { font-family: 'Outfit'; font-size: 16px; color: #e2e8f0; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;}
    .map-head p { font-size: 13px; color: #94a3b8; }
    .map-container { flex: 1; min-height: 480px; border-radius: 12px; border: 1px solid rgba(51,65,85,.8); background: #0f172a; overflow: hidden; }
    
    ::ng-deep .dx-form-group-content{background:transparent !important;}
    ::ng-deep .dx-field-item-label-text{color:#94a3b8 !important; font-size: 13px !important; font-weight: 500;}
    ::ng-deep .dx-texteditor-input{color:#e2e8f0 !important; font-family: 'DM Sans' !important;}
    ::ng-deep .dx-texteditor.dx-editor-outlined{background:rgba(15,23,42,.6) !important;border:1px solid #334155 !important;border-radius:8px !important;}
    ::ng-deep .dx-fileuploader-wrapper { padding: 0 !important; }
    ::ng-deep .dx-fileuploader-input-wrapper { display: flex; align-items: center; gap: 10px; }
    ::ng-deep .dx-fileuploader-button { border-radius: 6px !important; }
    ::ng-deep .dx-form-group-caption { font-size: 14px !important; color: #a78bfa !important; border-bottom: 1px solid rgba(51,65,85,.5); padding-bottom: 8px; margin-bottom: 15px; }

    .captcha-mock { background: #fafafa; border: 1px solid #d3d3d3; border-radius: 3px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; margin: 20px 0; cursor: pointer; max-width: 300px; box-shadow: 0 0 4px rgba(0,0,0,0.1); }
    .captcha-mock span { color: #555; font-size: 14px; font-family: Roboto, sans-serif; flex: 1; }
    .cbox { width: 28px; height: 28px; background: #fff; border: 2px solid #c1c1c1; border-radius: 2px; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
    .cbox.verified { border-color: transparent; }
    .cbox i.fa-check { color: #009e55; font-size: 24px; }
    .cbox i.fa-stop { display: none; }
    
    .success-msg{margin-top:20px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e;padding:14px 18px;border-radius:10px;font-size:14px;display:flex;align-items:center;gap:10px}.success-msg b{color:#f1f5f9; letter-spacing: 0.5px;}
    
    @media(max-width: 900px) { .form-wrapper { grid-template-columns: 1fr; } }
  `]
})
export class CommunitySubmitComponent implements AfterViewInit, OnDestroy {
  @ViewChild('submitForm', { static: false }) submitForm!: DxFormComponent;

  issueTypes = ['Ô nhiễm khói bụi', 'Đốt rác tự phát', 'Mùi hôi thối', 'Khí thải công nghiệp', 'Tiếng ồn', 'Nước thải', 'Khác'];

  reportData: any = {
    type: '',
    address: '',
    desc: '',
    name: '',
    phone: '',
    anonymous: false
  };

  submitted = false;
  code = Math.floor(Math.random() * 9000 + 1000);
  captchaVerified = false;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  initMap() {
    this.map = L.map('submitMap').setView([21.0285, 105.8542], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.reportData.address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      this.submitForm.instance.updateData('address', this.reportData.address);

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        const icon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="color:#ef4444;font-size:32px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));"><i class="fas fa-map-marker-alt"></i></div>`,
          iconSize: [32, 32], iconAnchor: [16, 32]
        });
        this.marker = L.marker([lat, lng], { icon }).addTo(this.map!);
      }
    });

    // Invalidate size to ensure map renders correctly in container
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  onFieldChanged(e: any) {
    if (e.dataField === 'address') {
      // Logic for address change via text input can go here (e.g., geocoding)
    }
  }

  verifyCaptcha() {
    this.captchaVerified = true;
  }

  submit() {
    const isValid = this.submitForm.instance.validate().isValid;
    if (isValid && this.captchaVerified) {
      this.submitted = true;
      this.code = Math.floor(Math.random() * 9000 + 1000);
      notify({
        message: 'Gửi phản ánh thành công! Chúng tôi đã ghi nhận.',
        type: 'success',
        displayTime: 4000
      });
    } else if (!isValid) {
      notify({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.', type: 'error', displayTime: 3000 });
    }
  }
}
