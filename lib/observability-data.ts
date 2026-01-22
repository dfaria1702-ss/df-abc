// Mock data for Observability service

export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

export interface MetricSeries {
  name: string;
  data: MetricDataPoint[];
}

export interface MetricsData {
  metrics: MetricSeries[];
  lastUpdated: number;
}

// Mock VM names
export const mockVMNames = [
  'web-server-01',
  'web-server-02',
  'api-server-01',
  'api-server-02',
  'database-server-01',
  'cache-server-01',
  'load-balancer-vm',
  'monitoring-server',
  'backup-server-01',
  'backup-server-02',
  'dev-server-01',
  'dev-server-02',
  'staging-server',
  'production-db',
  'analytics-server',
];

// Mock LB names
export const mockLBNames = [
  'web-lb-01',
  'api-lb-01',
  'app-lb-01',
  'internal-lb-01',
  'external-lb-01',
  'ssl-lb-01',
  'high-availability-lb',
  'regional-lb-01',
  'cdn-lb-01',
  'microservices-lb',
];

// VM Metrics: CPU, Memory, Disk I/O, Network In, Network Out
export const vmMetrics = [
  { id: 'cpu', name: 'CPU Usage', unit: '%' },
  { id: 'memory', name: 'Memory Usage', unit: '%' },
  { id: 'disk-io', name: 'Disk I/O', unit: 'MB/s' },
  { id: 'network-in', name: 'Network In', unit: 'Mbps' },
  { id: 'network-out', name: 'Network Out', unit: 'Mbps' },
];

// LB Metrics: Request Rate, Response Time, Error Rate, Active Connections, Throughput
export const lbMetrics = [
  { id: 'request-rate', name: 'Request Rate', unit: 'req/s' },
  { id: 'response-time', name: 'Response Time', unit: 'ms' },
  { id: 'error-rate', name: 'Error Rate', unit: '%' },
  { id: 'active-connections', name: 'Active Connections', unit: 'count' },
  { id: 'throughput', name: 'Throughput', unit: 'Mbps' },
];

// Generate time series data based on time range and granularity
function generateTimeSeries(
  startTime: number,
  endTime: number,
  granularityMs: number,
  baseValue: number,
  variance: number = 0.2
): MetricDataPoint[] {
  const data: MetricDataPoint[] = [];
  let currentTime = startTime;
  let currentValue = baseValue;

  while (currentTime <= endTime) {
    // Add some realistic variance
    const change = (Math.random() - 0.5) * variance;
    currentValue = Math.max(0, Math.min(100, currentValue + change));
    
    data.push({
      timestamp: currentTime,
      value: Number(currentValue.toFixed(2)),
    });

    currentTime += granularityMs;
  }

  return data;
}

// Generate metrics data for a VM
export function generateVMMetricsData(
  vmName: string,
  timeRangeHours: number,
  granularityMinutes: number
): MetricsData {
  const now = Date.now();
  const startTime = now - timeRangeHours * 60 * 60 * 1000;
  const endTime = now;
  const granularityMs = granularityMinutes * 60 * 1000;

  // Base values for different metrics (simulate realistic ranges)
  const baseValues = {
    cpu: 45 + Math.random() * 30, // 45-75%
    memory: 60 + Math.random() * 25, // 60-85%
    'disk-io': 10 + Math.random() * 40, // 10-50 MB/s
    'network-in': 50 + Math.random() * 100, // 50-150 Mbps
    'network-out': 30 + Math.random() * 80, // 30-110 Mbps
  };

  const metrics: MetricSeries[] = vmMetrics.map(metric => ({
    name: metric.name,
    data: generateTimeSeries(
      startTime,
      endTime,
      granularityMs,
      baseValues[metric.id as keyof typeof baseValues],
      metric.id === 'cpu' || metric.id === 'memory' ? 0.15 : 0.25
    ),
  }));

  return {
    metrics,
    lastUpdated: now,
  };
}

// Generate metrics data for a LB
export function generateLBMetricsData(
  lbName: string,
  timeRangeHours: number,
  granularityMinutes: number
): MetricsData {
  const now = Date.now();
  const startTime = now - timeRangeHours * 60 * 60 * 1000;
  const endTime = now;
  const granularityMs = granularityMinutes * 60 * 1000;

  // Base values for different metrics
  const baseValues = {
    'request-rate': 500 + Math.random() * 1500, // 500-2000 req/s
    'response-time': 50 + Math.random() * 100, // 50-150 ms
    'error-rate': 0.5 + Math.random() * 2, // 0.5-2.5%
    'active-connections': 200 + Math.random() * 800, // 200-1000
    throughput: 100 + Math.random() * 400, // 100-500 Mbps
  };

  const metrics: MetricSeries[] = lbMetrics.map(metric => ({
    name: metric.name,
    data: generateTimeSeries(
      startTime,
      endTime,
      granularityMs,
      baseValues[metric.id as keyof typeof baseValues],
      0.2
    ),
  }));

  return {
    metrics,
    lastUpdated: now,
  };
}

// Simulate API call with delay
export async function fetchVMMetrics(
  vmName: string,
  timeRangeHours: number,
  granularityMinutes: number
): Promise<MetricsData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateVMMetricsData(vmName, timeRangeHours, granularityMinutes));
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  });
}

export async function fetchLBMetrics(
  lbName: string,
  timeRangeHours: number,
  granularityMinutes: number
): Promise<MetricsData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateLBMetricsData(lbName, timeRangeHours, granularityMinutes));
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  });
}

// Configured Alerts Data
export interface ConfiguredAlert {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'paused';
  service: 'VM' | 'LB';
  metric: string;
  condition: 'less-than' | 'greater-than' | 'less-than-equal' | 'greater-than-equal';
  thresholdValue: number;
  notificationEnabled: boolean;
  notificationEmails?: string[];
  lastTriggeredAt?: string;
  createdOn: string;
}

// Helper function to format condition operator
export function formatConditionOperator(condition: string): string {
  const operatorMap: Record<string, string> = {
    'less-than': '<',
    'greater-than': '>',
    'less-than-equal': '<=',
    'greater-than-equal': '>=',
  };
  return operatorMap[condition] || condition;
}

// Mock configured alerts data
export const mockConfiguredAlerts: ConfiguredAlert[] = [
  {
    id: 'alert-001',
    name: 'High CPU Usage Alert',
    description: 'Alert when CPU usage exceeds 80% for more than 5 minutes',
    status: 'active',
    service: 'VM',
    metric: 'CPU Usage',
    condition: 'greater-than',
    thresholdValue: 80,
    notificationEnabled: true,
    notificationEmails: ['admin@example.com', 'devops@example.com'],
    lastTriggeredAt: getRecentTimestamp(0, 3),
    createdOn: '2024-01-15T10:30:00Z',
  },
  {
    id: 'alert-002',
    name: 'Low Memory Alert',
    description: 'Alert when available memory drops below 10%',
    status: 'active',
    service: 'VM',
    metric: 'Memory Usage',
    condition: 'less-than',
    thresholdValue: 10,
    notificationEnabled: true,
    notificationEmails: ['admin@example.com', 'team@example.com'],
    lastTriggeredAt: getRecentTimestamp(2, 3),
    createdOn: '2024-01-16T14:20:00Z',
  },
  {
    id: 'alert-003',
    name: 'High Response Time',
    description: 'Alert when response time exceeds 500ms',
    status: 'active',
    service: 'LB',
    metric: 'Response Time',
    condition: 'greater-than-equal',
    thresholdValue: 500,
    notificationEnabled: true,
    notificationEmails: ['ops@example.com', 'devops@example.com'],
    lastTriggeredAt: getRecentTimestamp(0, 5),
    createdOn: '2024-01-17T09:15:00Z',
  },
  {
    id: 'alert-004',
    name: 'Error Rate Threshold',
    description: 'Alert when error rate exceeds 5%',
    status: 'active',
    service: 'LB',
    metric: 'Error Rate',
    condition: 'greater-than',
    thresholdValue: 5,
    notificationEnabled: false,
    lastTriggeredAt: getRecentTimestamp(0, 1),
    createdOn: '2024-01-18T11:45:00Z',
  },
  {
    id: 'alert-005',
    name: 'Disk I/O Warning',
    description: 'Alert when disk I/O exceeds 100 MB/s',
    status: 'active',
    service: 'VM',
    metric: 'Disk I/O',
    condition: 'greater-than',
    thresholdValue: 100,
    notificationEnabled: true,
    notificationEmails: ['admin@example.com'],
    lastTriggeredAt: getRecentTimestamp(1, 8),
    createdOn: '2024-01-19T16:30:00Z',
  },
  {
    id: 'alert-006',
    name: 'Network Throughput Alert',
    description: 'Alert when network throughput exceeds 1 Gbps',
    status: 'inactive',
    service: 'LB',
    metric: 'Throughput',
    condition: 'greater-than-equal',
    thresholdValue: 1000,
    notificationEnabled: true,
    notificationEmails: ['ops@example.com'],
    createdOn: '2024-01-20T08:00:00Z',
  },
  {
    id: 'alert-007',
    name: 'Low Request Rate',
    description: 'Alert when request rate drops below 10 req/s',
    status: 'active',
    service: 'LB',
    metric: 'Request Rate',
    condition: 'less-than-equal',
    thresholdValue: 10,
    notificationEnabled: false,
    createdOn: '2024-01-21T13:20:00Z',
  },
  {
    id: 'alert-008',
    name: 'High Active Connections',
    description: 'Alert when active connections exceed 5000',
    status: 'paused',
    service: 'LB',
    metric: 'Active Connections',
    condition: 'greater-than',
    thresholdValue: 5000,
    notificationEnabled: true,
    notificationEmails: ['devops@example.com'],
    createdOn: '2024-01-22T10:10:00Z',
  },
  {
    id: 'alert-009',
    name: 'Network Inbound Alert',
    description: 'Alert when network inbound exceeds 500 Mbps',
    status: 'active',
    service: 'VM',
    metric: 'Network In',
    condition: 'greater-than',
    thresholdValue: 500,
    notificationEnabled: true,
    notificationEmails: ['admin@example.com', 'network@example.com'],
    createdOn: '2024-01-23T15:45:00Z',
  },
  {
    id: 'alert-010',
    name: 'Network Outbound Alert',
    description: 'Alert when network outbound exceeds 300 Mbps',
    status: 'active',
    service: 'VM',
    metric: 'Network Out',
    condition: 'greater-than',
    thresholdValue: 300,
    notificationEnabled: false,
    createdOn: '2024-01-24T12:30:00Z',
  },
  {
    id: 'alert-011',
    name: 'Memory Usage Critical',
    description: 'Alert when memory usage exceeds 95%',
    status: 'active',
    service: 'VM',
    metric: 'Memory Usage',
    condition: 'greater-than-equal',
    thresholdValue: 95,
    notificationEnabled: true,
    notificationEmails: ['admin@example.com', 'devops@example.com', 'team@example.com'],
    createdOn: '2024-01-25T09:00:00Z',
  },
  {
    id: 'alert-012',
    name: 'CPU Usage Low Threshold',
    description: 'Alert when CPU usage drops below 5% (idle detection)',
    status: 'inactive',
    service: 'VM',
    metric: 'CPU Usage',
    condition: 'less-than',
    thresholdValue: 5,
    notificationEnabled: false,
    createdOn: '2024-01-26T14:15:00Z',
  },
];

// Triggered Alerts Data
export interface TriggeredAlert {
  id: string;
  alertId: string; // Reference to configured alert
  alertName: string;
  triggeredTimestamp: string;
  resourceName: string;
  service: 'VM' | 'LB';
  condition: 'less-than' | 'greater-than' | 'less-than-equal' | 'greater-than-equal';
  thresholdValue: number;
  metric: string;
  averageValue: number;
  peakValue: number;
  durationMinutes: number;
}

// Helper function to generate recent timestamps
function getRecentTimestamp(daysAgo: number, hoursAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

// Helper function to get triggered alerts for a specific alert ID from the last N days
export function getTriggeredAlertsForAlert(
  alertId: string,
  days: number = 15
): TriggeredAlert[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockTriggeredAlerts.filter(alert => {
    if (alert.alertId !== alertId) return false;
    const alertDate = new Date(alert.triggeredTimestamp);
    return alertDate >= cutoffDate;
  });
}

// Mock triggered alerts data with recent timestamps
export const mockTriggeredAlerts: TriggeredAlert[] = [
  {
    id: 'triggered-001',
    alertId: 'alert-001',
    alertName: 'High CPU Usage Alert',
    triggeredTimestamp: getRecentTimestamp(1, 2),
    resourceName: 'web-server-01',
    service: 'VM',
    condition: 'greater-than',
    thresholdValue: 80,
    metric: 'CPU Usage',
    averageValue: 85.5,
    peakValue: 92.3,
    durationMinutes: 12,
  },
  {
    id: 'triggered-002',
    alertId: 'alert-002',
    alertName: 'Low Memory Alert',
    triggeredTimestamp: getRecentTimestamp(2, 3),
    resourceName: 'api-server-02',
    service: 'VM',
    condition: 'less-than',
    thresholdValue: 10,
    metric: 'Memory Usage',
    averageValue: 8.2,
    peakValue: 9.8,
    durationMinutes: 8,
  },
  {
    id: 'triggered-003',
    alertId: 'alert-003',
    alertName: 'High Response Time',
    triggeredTimestamp: getRecentTimestamp(0, 5),
    resourceName: 'web-lb-01',
    service: 'LB',
    condition: 'greater-than-equal',
    thresholdValue: 500,
    metric: 'Response Time',
    averageValue: 625.8,
    peakValue: 892.4,
    durationMinutes: 15,
  },
  {
    id: 'triggered-004',
    alertId: 'alert-004',
    alertName: 'Error Rate Threshold',
    triggeredTimestamp: getRecentTimestamp(3, 1),
    resourceName: 'api-lb-01',
    service: 'LB',
    condition: 'greater-than',
    thresholdValue: 5,
    metric: 'Error Rate',
    averageValue: 7.3,
    peakValue: 12.5,
    durationMinutes: 25,
  },
  {
    id: 'triggered-005',
    alertId: 'alert-005',
    alertName: 'Disk I/O Warning',
    triggeredTimestamp: getRecentTimestamp(1, 8),
    resourceName: 'database-server-01',
    service: 'VM',
    condition: 'greater-than',
    thresholdValue: 100,
    metric: 'Disk I/O',
    averageValue: 125.6,
    peakValue: 145.2,
    durationMinutes: 18,
  },
  {
    id: 'triggered-006',
    alertId: 'alert-001',
    alertName: 'High CPU Usage Alert',
    triggeredTimestamp: getRecentTimestamp(0, 3),
    resourceName: 'web-server-02',
    service: 'VM',
    condition: 'greater-than',
    thresholdValue: 80,
    metric: 'CPU Usage',
    averageValue: 88.7,
    peakValue: 95.1,
    durationMinutes: 22,
  },
  {
    id: 'triggered-007',
    alertId: 'alert-003',
    alertName: 'High Response Time',
    triggeredTimestamp: getRecentTimestamp(4, 2),
    resourceName: 'app-lb-01',
    service: 'LB',
    condition: 'greater-than-equal',
    thresholdValue: 500,
    metric: 'Response Time',
    averageValue: 580.2,
    peakValue: 750.6,
    durationMinutes: 30,
  },
  {
    id: 'triggered-008',
    alertId: 'alert-002',
    alertName: 'Low Memory Alert',
    triggeredTimestamp: getRecentTimestamp(5, 4),
    resourceName: 'cache-server-01',
    service: 'VM',
    condition: 'less-than',
    thresholdValue: 10,
    metric: 'Memory Usage',
    averageValue: 7.5,
    peakValue: 9.2,
    durationMinutes: 5,
  },
  {
    id: 'triggered-009',
    alertId: 'alert-005',
    alertName: 'Disk I/O Warning',
    triggeredTimestamp: getRecentTimestamp(2, 6),
    resourceName: 'backup-server-01',
    service: 'VM',
    condition: 'greater-than',
    thresholdValue: 100,
    metric: 'Disk I/O',
    averageValue: 118.3,
    peakValue: 132.8,
    durationMinutes: 10,
  },
  {
    id: 'triggered-010',
    alertId: 'alert-004',
    alertName: 'Error Rate Threshold',
    triggeredTimestamp: getRecentTimestamp(0, 1),
    resourceName: 'external-lb-01',
    service: 'LB',
    condition: 'greater-than',
    thresholdValue: 5,
    metric: 'Error Rate',
    averageValue: 8.9,
    peakValue: 15.2,
    durationMinutes: 35,
  },
];

