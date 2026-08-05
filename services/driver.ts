// ============================================================
// services/driver.ts — Driver profile & shift service
// ============================================================

import { apiClient } from './api';
import { DriverShift, User } from '../types';

function mapProfile(data: any): Partial<User> {
  return {
    id: data.id ?? data.userId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'DRIVER',
    employeeId: data.employeeId,
    phone: data.phone,
    photoUrl: data.photoUrl,
    licenseNumber: data.licenseNumber,
    licenseExpiry: data.licenseExpiry,
    assignedDepot: data.assignedDepot,
    assignedVehicle: data.assignedVehicle,
  };
}

export const driverService = {
  async getProfile(): Promise<Partial<User>> {
    const response = await apiClient.get('/drivers/me');
    return mapProfile(response.data);
  },

  async updateProfile(data: Partial<User>): Promise<Partial<User>> {
    const response = await apiClient.put('/drivers/me', {
      phone: data.phone,
      photoUrl: data.photoUrl,
    });
    return mapProfile(response.data);
  },

  async getCurrentShift(): Promise<DriverShift> {
    const response = await apiClient.get('/drivers/me/shift');
    const d = response.data;
    return {
      shiftId: d.shiftId,
      shiftName: d.shiftName,
      startTime: d.startTime,
      endTime: d.endTime,
      busNumber: d.busNumber,
      routeNumber: d.routeNumber,
      routeName: d.routeName,
      status: d.status,
    };
  },
};
