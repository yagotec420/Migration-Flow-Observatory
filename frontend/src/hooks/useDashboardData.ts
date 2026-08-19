import { useQuery } from '@tanstack/react-query';
import { counterService } from '../services/counterService';
import { migrationService } from '../services/migrationService';
import { statisticsService } from '../services/statisticsService';
import { timelineService } from '../services/timelineService';
import type { RouteFilters, TimelineFilters } from '../types/api';
import { filterExcludedRoutes } from '../utils/countryFilters';

const staleTime = 30_000;

export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: counterService.dashboard, staleTime, refetchInterval: 60_000 });

export const useRoutes = (filters: RouteFilters) =>
  useQuery({
    queryKey: ['routes', filters],
    queryFn: () => migrationService.list({ ...filters, limit: 100 }),
    staleTime,
    select: filterExcludedRoutes,
  });

export const useStatistics = (countryId?: string) =>
  useQuery({
    queryKey: ['statistics', countryId],
    queryFn: () => statisticsService.get(countryId),
    staleTime,
    refetchInterval: 60_000,
  });

export const useTimeline = (filters: TimelineFilters) =>
  useQuery({ queryKey: ['timeline', filters], queryFn: () => timelineService.list(filters), staleTime });
