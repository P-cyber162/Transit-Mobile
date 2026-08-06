// ============================================================
// services/incidents.ts — Incident Reporting Service
// Mirrors web driverMeApi.reportIncident / incidents()
// ============================================================

import { apiClient } from './api';
import { IncidentReport } from '../types';

function mapIncident(i: any): IncidentReport {
  return {
    id: String(i.id),
    title: i.title || undefined,
    category: (i.category || 'OTHER') as IncidentReport['category'],
    severity: (i.severity || 'MEDIUM') as IncidentReport['severity'],
    description: i.description || i.details || '',
    latitude: i.latitude != null ? Number(i.latitude) : undefined,
    longitude: i.longitude != null ? Number(i.longitude) : undefined,
    timestamp: i.createdAt || i.timestamp || new Date().toISOString(),
    status: (i.status === 'OPEN' ? 'SUBMITTED' : i.status) as IncidentReport['status'],
  };
}

export const incidentsService = {
  async submitReport(report: IncidentReport): Promise<{ success: boolean; id: string }> {
    const body: Record<string, unknown> = {
      title: report.title?.trim() || `${String(report.category).replace(/_/g, ' ')} report`,
      category: report.category,
      description: report.description,
      severity: report.severity || 'MEDIUM',
    };
    if (report.latitude != null && report.longitude != null) {
      body.latitude = report.latitude;
      body.longitude = report.longitude;
    }
    const response = await apiClient.post('/drivers/me/incidents', body);
    return { success: true, id: String(response.data.id) };
  },

  async getMyIncidents(): Promise<IncidentReport[]> {
    const response = await apiClient.get('/drivers/me/incidents');
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(mapIncident);
  },
};
