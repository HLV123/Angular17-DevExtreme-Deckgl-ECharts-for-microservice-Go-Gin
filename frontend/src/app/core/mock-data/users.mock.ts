import { User } from '../models';

export const MOCK_USERS: User[] = [
  { id: 'U001', email: 'admin@urbanair.vn', fullName: 'Nguyễn Quản Trị', avatar: '', role: 'admin', department: 'Ban Quản trị', phone: '0901234567', isActive: true, lastLogin: new Date().toISOString(), createdAt: '2023-01-01', language: 'vi', theme: 'dark' },
  { id: 'U002', email: 'expert@urbanair.vn', fullName: 'Trần Chuyên Gia', avatar: '', role: 'expert', department: 'Phòng Phân tích', phone: '0912345678', isActive: true, lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: '2023-02-15', language: 'vi', theme: 'dark' },
  { id: 'U003', email: 'operator@urbanair.vn', fullName: 'Lê Vận Hành', avatar: '', role: 'operator', department: 'Phòng Vận hành', phone: '0923456789', isActive: true, lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2023-03-01', language: 'vi', theme: 'dark' },
  { id: 'U004', email: 'leader@urbanair.vn', fullName: 'Phạm Lãnh Đạo', avatar: '', role: 'leader', department: 'Ban Giám đốc', phone: '0934567890', isActive: true, lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: '2023-01-01', language: 'vi', theme: 'dark' },
  { id: 'U005', email: 'citizen@urbanair.vn', fullName: 'Hoàng Dân', avatar: '', role: 'citizen', department: '', phone: '0945678901', isActive: true, lastLogin: new Date(Date.now() - 172800000).toISOString(), createdAt: '2024-01-15', language: 'vi', theme: 'dark' },
  { id: 'U006', email: 'partner@urbanair.vn', fullName: 'API Partner Corp', avatar: '', role: 'partner', department: 'External', phone: '0956789012', isActive: true, lastLogin: new Date(Date.now() - 259200000).toISOString(), createdAt: '2024-06-01', language: 'en', theme: 'dark' },
  ...Array.from({ length: 14 }, (_, i) => ({
    id: `U${String(i + 7).padStart(3, '0')}`,
    email: `user${i + 7}@urbanair.vn`,
    fullName: `Nhân viên ${i + 7}`,
    avatar: '',
    role: (['operator', 'expert', 'operator', 'citizen'] as const)[i % 4],
    department: ['Phòng Vận hành', 'Phòng Phân tích', 'Phòng IT', 'Người dân'][i % 4],
    phone: `098${String(i).padStart(7, '0')}`,
    isActive: i % 7 !== 0,
    lastLogin: new Date(Date.now() - i * 86400000).toISOString(),
    createdAt: '2024-03-01',
    language: 'vi' as const,
    theme: 'dark' as const,
  })),
];

export const MOCK_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'admin@urbanair.vn': { password: 'admin123', userId: 'U001' },
  'expert@urbanair.vn': { password: 'expert123', userId: 'U002' },
  'operator@urbanair.vn': { password: 'operator123', userId: 'U003' },
  'leader@urbanair.vn': { password: 'leader123', userId: 'U004' },
  'citizen@urbanair.vn': { password: 'citizen123', userId: 'U005' },
};
