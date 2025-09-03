import { apolloClient } from '../config/apollo.config';
import { GET_FACILITY_ANALYTICS } from '../graphql/facility.operations';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface FacilityAnalytics {
  totalIncidents: number;
  resolvedIncidents: number;
  averageResponseTime: number;
  bedUtilization: {
    total: number;
    occupied: number;
    available: number;
    rate: number;
  };
  ambulanceUtilization: {
    total: number;
    active: number;
    available: number;
    rate: number;
  };
  departmentMetrics: Array<{
    departmentId: string;
    name: string;
    caseload: number;
    averageWaitTime: number;
  }>;
}

export class AnalyticsService {
  async getFacilityAnalytics(
    facilityId: string,
    dateRange?: DateRange
  ): Promise<FacilityAnalytics | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_FACILITY_ANALYTICS,
        variables: {
          facilityId,
          dateRange,
        },
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
      });

      return data?.facilityAnalytics || null;
    } catch (error) {
      console.error('Error fetching facility analytics:', error);
      return null;
    }
  }

  async getPerformanceMetrics(facilityId: string): Promise<{
    responseTimeMetrics: {
      average: number;
      median: number;
      percentile95: number;
    };
    resolutionRate: number;
    patientSatisfaction: number;
  } | null> {
    try {
      const analytics = await this.getFacilityAnalytics(facilityId);
      if (!analytics) return null;

      // Calculate performance metrics from analytics data
      return {
        responseTimeMetrics: {
          average: analytics.averageResponseTime,
          median: analytics.averageResponseTime * 0.8, // Estimated
          percentile95: analytics.averageResponseTime * 1.5, // Estimated
        },
        resolutionRate: analytics.totalIncidents > 0 
          ? (analytics.resolvedIncidents / analytics.totalIncidents) * 100 
          : 0,
        patientSatisfaction: 85, // This would come from patient feedback system
      };
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return null;
    }
  }

  async getResourceUtilization(facilityId: string): Promise<{
    beds: { utilization: number; trend: 'up' | 'down' | 'stable' };
    ambulances: { utilization: number; trend: 'up' | 'down' | 'stable' };
    staff: { utilization: number; trend: 'up' | 'down' | 'stable' };
  } | null> {
    try {
      const analytics = await this.getFacilityAnalytics(facilityId);
      if (!analytics) return null;

      return {
        beds: {
          utilization: analytics.bedUtilization.rate,
          trend: 'stable', // This would be calculated from historical data
        },
        ambulances: {
          utilization: analytics.ambulanceUtilization.rate,
          trend: 'stable',
        },
        staff: {
          utilization: 75, // This would come from staff scheduling system
          trend: 'stable',
        },
      };
    } catch (error) {
      console.error('Error fetching resource utilization:', error);
      return null;
    }
  }

  async generateReport(
    facilityId: string,
    reportType: 'daily' | 'weekly' | 'monthly',
    dateRange?: DateRange
  ): Promise<{
    reportId: string;
    generatedAt: string;
    data: any;
  } | null> {
    try {
      const analytics = await this.getFacilityAnalytics(facilityId, dateRange);
      if (!analytics) return null;

      const reportId = `report_${facilityId}_${Date.now()}`;
      
      return {
        reportId,
        generatedAt: new Date().toISOString(),
        data: {
          summary: analytics,
          reportType,
          period: dateRange || {
            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();