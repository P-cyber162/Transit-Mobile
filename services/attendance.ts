// ============================================================
// services/attendance.ts — Driver Attendance Service
// ============================================================

import { apiClient } from './api';
import { AttendanceRecord } from '../types';

function mapAttendance(a: any): AttendanceRecord {
  return {
    id: String(a.id),
    date: a.date || new Date().toISOString().split('T')[0],
    checkInTime: a.checkInTime || '',
    checkOutTime: a.checkOutTime,
    shiftDurationHours: a.shiftDurationHours,
    status: (a.status || 'PRESENT') as AttendanceRecord['status'],
  };
}

export const attendanceService = {
  async getTodayAttendance(): Promise<AttendanceRecord | null> {
    try {
      const response = await apiClient.get('/drivers/me/attendance/today');
      if (!response.data) return null;
      return mapAttendance(response.data);
    } catch {
      return null;
    }
  },

  async checkIn(): Promise<AttendanceRecord> {
    const response = await apiClient.post('/drivers/me/attendance/check-in');
    return mapAttendance(response.data);
  },

  async checkOut(): Promise<AttendanceRecord> {
    const response = await apiClient.post('/drivers/me/attendance/check-out');
    return mapAttendance(response.data);
  },

  async getHistory(): Promise<AttendanceRecord[]> {
    try {
      const response = await apiClient.get('/drivers/me/attendance');
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(mapAttendance);
    } catch {
      return [];
    }
  },
};
