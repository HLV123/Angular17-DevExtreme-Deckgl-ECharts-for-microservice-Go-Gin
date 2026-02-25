import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuditLog } from '../models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private logs: AuditLog[] = Array.from({ length: 80 }, (_, i) => {
    const actions = ['LOGIN','LOGOUT','CREATE_STATION','UPDATE_STATION','DELETE_ALERT','EXPORT_REPORT','UPDATE_CONFIG','ACKNOWLEDGE_ALERT','CLOSE_ALERT','CREATE_MODEL','IMPORT_DATA','CREATE_USER','UPDATE_ROLE'];
    const modules = ['Auth','Stations','Alerts','Reports','Config','AI/ML','Data Import','Users','Roles'];
    const users = [{id:'USR001',name:'Nguyễn Văn Admin'},{id:'USR002',name:'Trần Thị Expert'},{id:'USR003',name:'Lê Văn Operator'},{id:'USR004',name:'Phạm Minh Leader'}];
    const u = users[Math.floor(Math.random()*users.length)];
    return {
      id: `LOG${String(i+1).padStart(4,'0')}`, userId: u.id, userName: u.name,
      action: actions[Math.floor(Math.random()*actions.length)],
      module: modules[Math.floor(Math.random()*modules.length)],
      resource: ['Station ST001', 'Alert ALT045', 'Report RPT012', 'User USR005', 'Model LSTM v3', 'Config SMTP'][Math.floor(Math.random() * 6)],
      details: ['Tạo mới','Cập nhật','Xóa','Xuất file','Đăng nhập','Xác nhận','Đóng'][Math.floor(Math.random()*7)] + ' thành công',
      ipAddress: `10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      timestamp: new Date(Date.now() - Math.random()*30*24*3600000).toISOString()
    };
  }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  getAuditLogs(filter?: {action?:string; module?:string}): Observable<AuditLog[]> {
    let r = [...this.logs];
    if (filter?.action) r = r.filter(l => l.action === filter.action);
    if (filter?.module) r = r.filter(l => l.module === filter.module);
    return of(r);
  }
}
