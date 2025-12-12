# Listener Data Flow Documentation

## Overview
This document describes how listener data flows from creation/editing through the modal to display in the listeners table, including all captured sections and their display.

## Listener Modal Sections

When creating or editing a listener, the modal captures data in **4 main sections**:

### 1. Listener Settings
**Captured Data:**
- Listener Name (e.g., "web-listener", "api-listener")
- Protocol (HTTP, HTTPS for ALB; TCP for NLB)
- Port (80, 443, or custom)
- SSL Certificate (for HTTPS listeners only)

**View Mode Display:**
- Shows protocol and port in a styled card
- Displays certificate information when applicable

### 2. Policy & Rules Configuration (ALB only)
**Captured Data:**
- **Policies:**
  - Policy Name
  - Action (forward, redirect, fixed-response)
  - Redirect URL (if applicable)
  
- **Rules:**
  - Rule Type (host-header, path-pattern, http-header, query-string)
  - Comparator (equals, starts-with, contains, etc.)
  - Value (matching criteria)
  - Key (for header/query-string rules)

**View Mode Display:**
- Shows all policies in separate cards
- Shows all rules in separate cards with type, comparator, and value

### 3. Pool Configuration
**Captured Data:**
- Pool Name
- Protocol (HTTP, HTTPS, TCP, UDP)
- Algorithm (round-robin, least-connections, ip-hash)
- Target Group (selected from available target groups)
- **Auto-enriched data:**
  - Target Group Status (healthy/unhealthy/degraded)
  - Target Count (total number of targets)
  - Healthy Targets (number of healthy targets)

**View Mode Display:**
- Shows all pool details in a styled card
- Displays target group name with health status badge
- Shows target group health summary

### 4. Registered Targets (View Mode Only)
**Display Data:**
- Target Name
- IP Address (clickable, styled as primary)
- Port
- Weight
- Target Health Status (healthy/unhealthy/draining with colored badges)

**Data Source:**
- Automatically populated from selected target groups
- Shows all targets from all pools configured in the listener

## Data Flow

### Creating a New Listener

1. **User opens modal** → Click "Add Listener" button
2. **User fills in data** → All 4 sections are available for input
3. **User clicks Save** → `handleSaveListener` function is called
4. **Data enrichment** → System automatically:
   - Looks up selected target group by name
   - Calculates health status based on target members
   - Adds `targetGroupStatus`, `targetCount`, and `healthyTargets` to each pool
5. **Listener added** → New listener appears in listeners table with:
   - Listener name (clickable to view details)
   - Protocol:Port (as a badge)
   - Target Group name with health status badge

### Editing an Existing Listener

1. **User opens modal** → Click Edit from actions menu or edit button
2. **Modal pre-populated** → All existing data is loaded into the form
3. **User modifies data** → Any section can be updated
4. **User clicks Save** → `handleSaveListener` function is called
5. **Data enrichment** → Same enrichment process as creation
6. **Listener updated** → Table reflects all changes immediately

### Viewing a Listener

1. **User opens modal** → Click on listener name or View from actions menu
2. **View mode display** → Shows all 4 sections in read-only format:
   - **Listener Settings:** Protocol and port details
   - **Policy & Rules Configuration:** All policies and rules (ALB only)
   - **Pool Configuration:** Pool details with target group and health status
   - **Registered Targets:** Full table of all targets with health status
3. **Edit option** → User can click edit icon to switch to edit mode

## Listeners Table Display

The listeners table shows a summary view with these columns:

### Name Column
- Displays listener name
- Clickable to open view modal
- Shows "Unnamed Listener" if no name provided

### Protocol Column
- Shows protocol and port in a badge
- Format: "HTTPS:443", "HTTP:80", "TCP:8080"

### Target Group Column
- Shows target group name from first pool
- **Health Status Badge** (NEW):
  - 🟢 **Healthy** - Green badge when all targets are healthy
  - 🔴 **Unhealthy** - Red badge when no targets are healthy
  - 🟡 **Degraded** - Yellow badge when some targets are unhealthy
- Shows "—" if no target group configured

### Actions Column
- View button (eye icon)
- Edit button (pencil icon)
- Delete button (trash icon) - only if more than 1 listener exists

## Automatic Data Enrichment

When a listener is saved, the system automatically enriches the data:

```typescript
// For each pool in the listener
const enrichedPool = {
  ...pool,
  targetGroupStatus: 'healthy' | 'unhealthy' | 'degraded',
  targetCount: number,        // Total number of targets
  healthyTargets: number,     // Number of healthy targets
};
```

### Health Status Calculation:
- **Healthy**: All targets in the target group are healthy
- **Unhealthy**: No targets in the target group are healthy
- **Degraded**: Some targets are healthy, but not all

## Mock Data Integration

The system integrates with mock data from `lib/data.ts`:

### Target Groups
```typescript
interface TargetGroup {
  id: string;
  name: string;
  type: "instance" | "ip" | "lambda";
  protocol: "HTTP" | "HTTPS" | "TCP" | "UDP";
  port: number;
  vpc: string;
  healthCheck: {...};
  targets: number;
  targetMembers: TargetMember[];
  status: "healthy" | "unhealthy" | "unused" | "degraded";
  loadBalancer?: string;
  createdOn: string;
}
```

### Target Members
```typescript
interface TargetMember {
  id: string;
  type: "VM" | "Container" | "IP";
  name: string;
  ipAddress: string;
  port: number;
  weight: number;
  status: "healthy" | "unhealthy" | "draining";
}
```

## Component Files

### Modified Files:
1. **`listeners-table.tsx`**
   - Added `StatusBadge` import
   - Updated Target Group column to show health badges
   - Extracts `targetGroupStatus` from pool data

2. **`alb-create-form.tsx`**
   - Added `targetGroups` import from `@/lib/data`
   - Enhanced `handleSaveListener` to enrich listener data
   - Automatically calculates health status for each pool

3. **`nlb-create-form.tsx`**
   - Added `targetGroups` import from `@/lib/data`
   - Enhanced `handleSaveListener` to enrich listener data
   - Automatically calculates health status for each pool

4. **`listener-view-edit-modal.tsx`** (No changes needed)
   - Already properly structured with 4 sections
   - Already handles data updates correctly
   - Already displays health badges in view mode

### Existing Components Used:
- **`status-badge.tsx`** - Displays colored badges for health status
  - Green for healthy
  - Red for unhealthy
  - Yellow for degraded

## User Experience Flow

### Complete Creation Flow:
1. Click "Add Listener" button
2. **Section 1:** Enter listener name, select protocol (auto-fills port), add certificate if HTTPS
3. **Section 2:** Configure policies and rules (ALB only) - add multiple if needed
4. **Section 3:** Add pools - name, protocol, algorithm, select target group
5. Click "Save"
6. **Automatic enrichment** happens behind the scenes
7. Listener appears in table with all information including health badge
8. Click on listener name to view all details in all 4 sections

### Complete Edit Flow:
1. Click Edit on existing listener (from actions menu)
2. **Section 1:** Update listener settings if needed
3. **Section 2:** Modify policies/rules if needed (ALB only)
4. **Section 3:** Update pool configuration or change target group
5. Click "Save"
6. **Automatic re-enrichment** updates health data
7. Table immediately reflects all changes
8. Health badges update based on newly selected target groups

## Benefits

1. **Automatic Health Tracking**: No manual entry of health data required
2. **Real-time Updates**: Changes immediately visible in the table
3. **Data Consistency**: Health data always matches selected target groups
4. **Complete Information**: All 4 sections captured and displayed properly
5. **Visual Clarity**: Color-coded badges make health status immediately apparent
6. **Scalability**: Works with any number of pools and target groups

## Testing Scenarios

### Scenario 1: Create Listener with Healthy Target Group
- Select "production-web-targets" (3/4 healthy)
- Save listener
- **Expected**: Degraded badge (yellow) appears next to target group name

### Scenario 2: Create Listener with Unhealthy Target Group  
- Select "notification-service" (0/2 healthy)
- Save listener
- **Expected**: Unhealthy badge (red) appears next to target group name

### Scenario 3: Edit Listener to Change Target Group
- Open existing listener
- Change target group from healthy to unhealthy one
- Save
- **Expected**: Badge color updates immediately in table

### Scenario 4: View Listener Details
- Click on any listener name
- **Expected**: See all 4 sections with complete data
- **Expected**: Registered Targets section shows full target table
- **Expected**: Health badges visible in pool configuration

## Summary

The listener management system now provides:
- ✅ Complete data capture in 4 structured sections
- ✅ Automatic health status enrichment
- ✅ Visual health indicators in table view
- ✅ Detailed health information in view mode
- ✅ Seamless create/edit/view workflows
- ✅ Integration with mock target group data
- ✅ Real-time updates and data consistency

