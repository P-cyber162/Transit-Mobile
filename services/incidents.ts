// ============================================================
// services/incidents.ts — Incident Reporting Service
// ============================================================

import { apiClient } from './api';
import { IncidentReport } from '../types';

function mapIncident(i: any): IncidentReport {
  return {
    id: String(i.id),
    category: (i.category || 'OTHER') as IncidentReport['category'],
    description: i.description || '',
    latitude: Number(i.latitude ?? 0),
    longitude: Number(i.longitude ?? 0),
    timestamp: i.createdAt || i.timestamp || new Date().toISOString(),
    status: (i.status === 'OPEN' ? 'SUBMITTED' : i.status) as IncidentReport['status'],
  };
}

export const incidentsService = {
  async submitReport(report: IncidentReport): Promise<{ success: boolean; id: string }> {
    const response = await apiClient.post('/drivers/me/incidents', {
      category: report.category,
      title: `${report.category.replace(/_/g, ' ')} report`,
      description: report.description,
      latitude: report.latitude,
      longitude: report.longitude,
      severity: report.category === 'ACCIDENT' || report.category === 'VEHICLE_BREAKDOWN' ? 'HIGH' : 'MEDIUM',
    });
    return { success: true, id: String(response.data.id) };
  },

  async getMyIncidents(): Promise<IncidentReport[]> {
    try {
      const response = await apiClient.get('/drivers/me/incidents');
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(mapIncident);
    } catch {
      return [];
    }
  },
};
