// Utility to filter data based on user type for demo purposes

// Get user type from localStorage
export function getUserType(): 'new' | 'existing' | 'regular' {
  if (typeof window === 'undefined') {
    return 'regular';
  }

  try {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      return 'regular';
    }

    const user = JSON.parse(userData);
    return user.userType || 'regular';
  } catch (error) {
    console.error('Error getting user type:', error);
    return 'regular';
  }
}

// Filter function for list data
export function filterDataForUser<T>(data: T[], resourceType?: string): T[] {
  const userType = getUserType();

  // NEW USER: Show empty lists (no data)
  if (userType === 'new') {
    return [];
  }

  // EXISTING USER & REGULAR USER: Show all current data
  return data;
}

// Filter function for billing/usage data
export function filterBillingDataForUser(data: any): any {
  const userType = getUserType();

  // NEW USER: Show zero/empty billing data
  if (userType === 'new') {
    if (Array.isArray(data)) {
      return [];
    }

    if (typeof data === 'object' && data !== null) {
      // Handle billing summary objects
      if ('totalCredits' in data) {
        return {
          ...data,
          totalCredits: 0,
          change: 0,
          chartData: [],
          table:
            data.table?.map((item: any) => ({
              ...item,
              credits: 0,
              percent: 0,
              change: 0,
            })) || [],
        };
      }

      // Zero out numeric values, empty arrays
      const zeroData = { ...data };
      Object.keys(zeroData).forEach(key => {
        if (typeof zeroData[key] === 'number') {
          zeroData[key] = 0;
        } else if (Array.isArray(zeroData[key])) {
          zeroData[key] = [];
        }
      });
      return zeroData;
    }

    if (typeof data === 'number') {
      return 0;
    }
  }

  // EXISTING USER & REGULAR USER: Show all current billing data
  return data;
}

// Check if user should see empty states
export function shouldShowEmptyState(
  data?: any[],
  resourceType?: string
): boolean {
  return getUserType() === 'new';
}

// Get user-specific empty state message
export function getEmptyStateMessage(resourceType: string): {
  title: string;
  description: string;
  actionText?: string;
} {
  const userType = getUserType();

  if (userType === 'new') {
    const messages = {
      vpc: {
        title: 'No VPCs yet',
        description:
          'Create your first Virtual Private Cloud to get started with secure, isolated cloud resources.',
        actionText: 'Create VPC',
      },
      subnet: {
        title: 'No Subnets yet',
        description:
          'Create subnets within your VPCs to organize and secure your network resources.',
        actionText: 'Create Subnet',
      },
      'security-group': {
        title: 'No Security Groups yet',
        description:
          'Create security groups to control inbound and outbound traffic for your resources.',
        actionText: 'Create Security Group',
      },
      'static-ips': {
        title: 'No Static IPs yet',
        description:
          'Reserve static IP addresses for your cloud resources to ensure consistent connectivity.',
        actionText: 'Reserve IP Address',
      },
      'load-balancer': {
        title: 'No Load Balancers yet',
        description:
          'Create load balancers to distribute incoming traffic across multiple targets for high availability.',
        actionText: 'Create Load Balancer',
      },
      'target-group': {
        title: 'No Target Groups yet',
        description:
          'Create target groups to define health check settings and routing rules for your load balancers.',
        actionText: 'Create Target Group',
      },
      dns: {
        title: 'No DNS Records yet',
        description:
          'Create DNS records to resolve domain names to IP addresses and configure domain settings.',
        actionText: 'Create DNS Record',
      },
      'hosted-zones': {
        title: 'No Hosted Zones yet',
        description:
          'Create hosted zones to manage DNS records for your domains and subdomains.',
        actionText: 'Create Hosted Zone',
      },
      volumes: {
        title: 'No Volumes yet',
        description:
          'Create block storage volumes to provide persistent storage for your cloud instances.',
        actionText: 'Create Volume',
      },
      'fine-tuning': {
        title: 'No Fine-tuning Jobs yet',
        description:
          'Create fine-tuning jobs to customize foundation models for your specific use cases and domain requirements.',
        actionText: 'Create Fine Tuning Job',
      },
      deployments: {
        title: 'No Deployments yet',
        description:
          'Deploy your AI models as scalable APIs to serve your applications and users.',
        actionText: 'New Deploy',
      },
      'model-evaluation': {
        title: 'No Model Evaluations yet',
        description:
          'Evaluate AI model accuracy, performance metrics, and quality across different tasks and datasets.',
        actionText: 'New Evaluation',
      },
      'performance-evaluation': {
        title: 'No Performance Evaluations yet',
        description:
          'Assess model performance characteristics including latency, throughput, and resource utilization.',
        actionText: 'New Evaluation',
      },
      'key-management-service': {
        title: 'No Keys yet',
        description:
          'Create encryption keys to secure your data and applications. Manage symmetric, asymmetric, and HMAC keys for various use cases.',
        actionText: 'Create Key',
      },
      billing: {
        title: 'No Usage Yet',
        description:
          'Start using Krutrim Cloud services to see your usage and billing information here.',
      },
      transactions: {
        title: 'No Transactions Yet',
        description:
          'Your billing transactions will appear here once you start using our services.',
      },
      snapshots: {
        title: 'No Snapshots Found',
        description:
          'Create snapshots to capture point-in-time copies of your volumes for backup and disaster recovery.',
        actionText: 'Create Snapshot',
      },
      backup: {
        title: 'No Backups Found',
        description:
          'Create automated backups to ensure your data is protected and can be restored when needed.',
        actionText: 'Create Backup',
      },
      certificates: {
        title: 'No Certificates yet',
        description:
          'Import SSL/TLS certificates and other security credentials to secure your applications and services.',
        actionText: 'Upload Certificate',
      },
      asg: {
        title: 'No Auto Scaling Groups yet',
        description:
          'Create auto scaling groups to automatically adjust the number of instances based on demand and maintain application availability.',
        actionText: 'Create Auto Scaling Group',
      },
      template: {
        title: 'No Templates yet',
        description:
          'Create auto scaling templates to standardize your instance configurations and make it easier to launch consistent auto scaling groups.',
        actionText: 'Create Template',
      },
      'object-storage': {
        title: 'No Storage Buckets Yet',
        description:
          'Create your first storage bucket to start storing and managing your files in the cloud. Storage buckets provide scalable object storage with built-in redundancy and security.',
        actionText: 'Create Your First Bucket',
      },
      default: {
        title: `No ${resourceType} yet`,
        description: `Create your first ${resourceType} to get started.`,
        actionText: `Create ${resourceType}`,
      },
    };

    return messages[resourceType as keyof typeof messages] || messages.default;
  }

  // For existing users, this shouldn't be called since they have data
  return {
    title: 'No record available',
    description: 'No information to display at this time.',
  };
}
