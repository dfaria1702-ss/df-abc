// Mock data for IAM (Identity & Access Management)

export type UserStatus = 'invited' | 'active' | 'pending' | 'suspended' | 'blocked';
export type AccessType = 'console' | 'programmatic' | 'both';
export type PolicyType = 'VM' | 'Storage' | 'Network' | 'Kubernetes' | 'Database' | 'Billing' | 'IAM';
export type CRUDOperation = 'Create' | 'Read' | 'Update' | 'Delete';
export type Effect = 'Allow' | 'Deny';

// Policy Access Rule
export interface PolicyAccessRule {
  id: string;
  effect: Effect;
  operation: CRUDOperation;
  policyType: PolicyType;
  resourceName: string;
  conditions?: Record<string, string>;
}

// Policy
export interface Policy {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  createdAt: string;
  rules: PolicyAccessRule[];
}

// Role
export interface Role {
  id: string;
  name: string;
  description: string;
  policyIds: string[];
  createdAt: string;
  createdBy: string;
}

// Group
export interface Group {
  id: string;
  name: string;
  description: string;
  roleIds: string[];
  createdAt: string;
  createdBy: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  accessType: AccessType;
  roleIds: string[];
  groupIds: string[];
  invitedAt?: string;
  activatedAt?: string;
  lastActiveAt?: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    accessType: 'both',
    roleIds: ['role-1'],
    groupIds: ['group-1'],
    activatedAt: '2024-01-15T10:00:00Z',
    lastActiveAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    accessType: 'console',
    roleIds: ['role-2'],
    groupIds: ['group-2'],
    activatedAt: '2024-02-20T09:15:00Z',
    lastActiveAt: '2024-12-19T16:45:00Z',
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    status: 'invited',
    accessType: 'programmatic',
    roleIds: ['role-3'],
    groupIds: [],
    invitedAt: '2024-12-18T11:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    status: 'pending',
    accessType: 'both',
    roleIds: [],
    groupIds: ['group-1'],
    invitedAt: '2024-12-19T08:30:00Z',
  },
  {
    id: 'user-5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'active',
    accessType: 'programmatic',
    roleIds: ['role-1', 'role-2'],
    groupIds: ['group-2'],
    activatedAt: '2024-03-10T12:00:00Z',
    lastActiveAt: '2024-12-20T10:20:00Z',
  },
];

// Mock Policies
export const mockPolicies: Policy[] = [
  {
    id: 'policy-1',
    name: 'VM Full Access',
    description: 'Full access to all VM operations',
    creatorId: 'user-1',
    creatorName: 'John Doe',
    creatorEmail: 'john.doe@example.com',
    createdAt: '2024-01-10T10:00:00Z',
    rules: [
      {
        id: 'rule-1',
        effect: 'Allow',
        operation: 'Create',
        policyType: 'VM',
        resourceName: 'vm-*',
      },
      {
        id: 'rule-2',
        effect: 'Allow',
        operation: 'Read',
        policyType: 'VM',
        resourceName: 'vm-*',
      },
      {
        id: 'rule-3',
        effect: 'Allow',
        operation: 'Update',
        policyType: 'VM',
        resourceName: 'vm-*',
      },
      {
        id: 'rule-4',
        effect: 'Allow',
        operation: 'Delete',
        policyType: 'VM',
        resourceName: 'vm-*',
      },
    ],
  },
  {
    id: 'policy-2',
    name: 'Storage Read Only',
    description: 'Read-only access to storage resources',
    creatorId: 'user-1',
    creatorName: 'John Doe',
    creatorEmail: 'john.doe@example.com',
    createdAt: '2024-01-12T14:30:00Z',
    rules: [
      {
        id: 'rule-5',
        effect: 'Allow',
        operation: 'Read',
        policyType: 'Storage',
        resourceName: 'storage-*',
      },
    ],
  },
  {
    id: 'policy-3',
    name: 'Network Management',
    description: 'Full network management capabilities',
    creatorId: 'user-2',
    creatorName: 'Jane Smith',
    creatorEmail: 'jane.smith@example.com',
    createdAt: '2024-02-01T09:00:00Z',
    rules: [
      {
        id: 'rule-6',
        effect: 'Allow',
        operation: 'Create',
        policyType: 'Network',
        resourceName: 'vpc-*',
      },
      {
        id: 'rule-7',
        effect: 'Allow',
        operation: 'Read',
        policyType: 'Network',
        resourceName: '*',
      },
      {
        id: 'rule-8',
        effect: 'Allow',
        operation: 'Update',
        policyType: 'Network',
        resourceName: 'vpc-*',
      },
      {
        id: 'rule-9',
        effect: 'Deny',
        operation: 'Delete',
        policyType: 'Network',
        resourceName: 'vpc-production-*',
      },
    ],
  },
  {
    id: 'policy-4',
    name: 'Kubernetes Cluster Access',
    description: 'Access to Kubernetes cluster operations',
    creatorId: 'user-1',
    creatorName: 'John Doe',
    creatorEmail: 'john.doe@example.com',
    createdAt: '2024-01-20T11:15:00Z',
    rules: [
      {
        id: 'rule-10',
        effect: 'Allow',
        operation: 'Create',
        policyType: 'Kubernetes',
        resourceName: 'cluster-*',
      },
      {
        id: 'rule-11',
        effect: 'Allow',
        operation: 'Read',
        policyType: 'Kubernetes',
        resourceName: 'cluster-*',
      },
      {
        id: 'rule-12',
        effect: 'Allow',
        operation: 'Update',
        policyType: 'Kubernetes',
        resourceName: 'cluster-*',
      },
    ],
  },
  {
    id: 'policy-5',
    name: 'Billing View Only',
    description: 'View billing information only',
    creatorId: 'user-2',
    creatorName: 'Jane Smith',
    creatorEmail: 'jane.smith@example.com',
    createdAt: '2024-02-15T16:00:00Z',
    rules: [
      {
        id: 'rule-13',
        effect: 'Allow',
        operation: 'Read',
        policyType: 'Billing',
        resourceName: '*',
      },
    ],
  },
];

// Mock Roles
export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Full system access and control',
    policyIds: ['policy-1', 'policy-3', 'policy-4'],
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'user-1',
  },
  {
    id: 'role-2',
    name: 'Developer',
    description: 'Development and testing access',
    policyIds: ['policy-1', 'policy-2'],
    createdAt: '2024-01-18T14:20:00Z',
    createdBy: 'user-1',
  },
  {
    id: 'role-3',
    name: 'Viewer',
    description: 'Read-only access to resources',
    policyIds: ['policy-2', 'policy-5'],
    createdAt: '2024-02-01T09:30:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'role-4',
    name: 'Network Admin',
    description: 'Network infrastructure management',
    policyIds: ['policy-3'],
    createdAt: '2024-02-05T11:00:00Z',
    createdBy: 'user-1',
  },
];

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Engineering Team',
    description: 'Full engineering team with development access',
    roleIds: ['role-1', 'role-2'],
    createdAt: '2024-01-20T10:00:00Z',
    createdBy: 'user-1',
  },
  {
    id: 'group-2',
    name: 'Operations Team',
    description: 'Operations and infrastructure management',
    roleIds: ['role-4'],
    createdAt: '2024-02-10T14:00:00Z',
    createdBy: 'user-1',
  },
  {
    id: 'group-3',
    name: 'Read-Only Users',
    description: 'Users with read-only access',
    roleIds: ['role-3'],
    createdAt: '2024-02-15T09:00:00Z',
    createdBy: 'user-2',
  },
];

// Helper functions
export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getPolicyById(id: string): Policy | undefined {
  return mockPolicies.find(policy => policy.id === id);
}

export function getRoleById(id: string): Role | undefined {
  return mockRoles.find(role => role.id === id);
}

export function getGroupById(id: string): Group | undefined {
  return mockGroups.find(group => group.id === id);
}

export function getPoliciesByRoleId(roleId: string): Policy[] {
  const role = getRoleById(roleId);
  if (!role) return [];
  return role.policyIds.map(policyId => getPolicyById(policyId)!).filter(Boolean);
}

export function getRolesByGroupId(groupId: string): Role[] {
  const group = getGroupById(groupId);
  if (!group) return [];
  return group.roleIds.map(roleId => getRoleById(roleId)!).filter(Boolean);
}

export function getRolesByUserId(userId: string): Role[] {
  const user = getUserById(userId);
  if (!user) return [];
  
  // Get direct roles
  const directRoles = user.roleIds.map(roleId => getRoleById(roleId)!).filter(Boolean);
  
  // Get roles from groups
  const groupRoles = user.groupIds.flatMap(groupId => {
    const group = getGroupById(groupId);
    return group ? group.roleIds.map(roleId => getRoleById(roleId)!).filter(Boolean) : [];
  });
  
  // Combine and deduplicate
  const allRoles = [...directRoles, ...groupRoles];
  return Array.from(new Map(allRoles.map(role => [role.id, role])).values());
}

export function getGroupsByUserId(userId: string): Group[] {
  const user = getUserById(userId);
  if (!user) return [];
  return user.groupIds.map(groupId => getGroupById(groupId)!).filter(Boolean);
}

export function getUsersByRoleId(roleId: string): User[] {
  return mockUsers.filter(user => 
    user.roleIds.includes(roleId) || 
    user.groupIds.some(groupId => {
      const group = getGroupById(groupId);
      return group?.roleIds.includes(roleId);
    })
  );
}

export function getUsersByGroupId(groupId: string): User[] {
  return mockUsers.filter(user => user.groupIds.includes(groupId));
}

export function canDeleteRole(roleId: string): { canDelete: boolean; reason?: string } {
  const users = getUsersByRoleId(roleId);
  const groups = mockGroups.filter(group => group.roleIds.includes(roleId));
  
  if (users.length > 0 || groups.length > 0) {
    const reasons: string[] = [];
    if (users.length > 0) {
      reasons.push(`${users.length} user${users.length > 1 ? 's' : ''}`);
    }
    if (groups.length > 0) {
      reasons.push(`${groups.length} group${groups.length > 1 ? 's' : ''}`);
    }
    return {
      canDelete: false,
      reason: `Cannot delete role: it's attached to ${reasons.join(' and ')}`,
    };
  }
  
  return { canDelete: true };
}

export function canDeletePolicy(policyId: string): { canDelete: boolean; reason?: string } {
  const roles = mockRoles.filter(role => role.policyIds.includes(policyId));
  
  if (roles.length > 0) {
    return {
      canDelete: false,
      reason: `Cannot delete policy: it's attached to ${roles.length} role${roles.length > 1 ? 's' : ''}`,
    };
  }
  
  return { canDelete: true };
}

export function canDeleteGroup(groupId: string): { canDelete: boolean; reason?: string } {
  const users = getUsersByGroupId(groupId);
  
  if (users.length > 0) {
    return {
      canDelete: false,
      reason: `Cannot delete group: it has ${users.length} user${users.length > 1 ? 's' : ''} assigned`,
    };
  }
  
  return { canDelete: true };
}

// Get roles that use a policy
export function getRolesByPolicyId(policyId: string): Role[] {
  return mockRoles.filter(role => role.policyIds.includes(policyId));
}

// Get groups that use a role
export function getGroupsByRoleId(roleId: string): Group[] {
  return mockGroups.filter(group => group.roleIds.includes(roleId));
}

// Policy Type options for dropdown
export const policyTypeOptions: PolicyType[] = [
  'VM',
  'Storage',
  'Network',
  'Kubernetes',
  'Database',
  'Billing',
  'IAM',
];

// CRUD Operation options
export const crudOperationOptions: CRUDOperation[] = [
  'Create',
  'Read',
  'Update',
  'Delete',
];

// Effect options
export const effectOptions: Effect[] = ['Allow', 'Deny'];

