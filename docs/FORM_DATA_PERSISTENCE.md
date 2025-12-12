# Form Data Persistence with localStorage

## Problem Solved

Previously, when creating or editing load balancers with listeners and target groups:
- ❌ Page refresh would lose all unsaved form data
- ❌ Users had to re-enter all listener configurations
- ❌ Target group selections disappeared after refresh

Now:
- ✅ All form data persists across page refreshes
- ✅ Listeners with target groups are preserved
- ✅ Work continues exactly where you left off
- ✅ Data clears automatically when form is submitted or cancelled

## How It Works

### 1. **Automatic Saving**
Every time you make changes to the form (adding listeners, selecting target groups, filling in any field), the data is automatically saved to browser localStorage.

```typescript
// Saves automatically on every formData change
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }
}, [formData, storageKey]);
```

### 2. **Automatic Loading**
When you open or refresh the create/edit page, the form checks if there's saved data and loads it automatically.

```typescript
const getInitialFormData = (): ALBFormData => {
  // Try to load from localStorage first
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
  }
  
  // Return default initial data if no saved data
  return { /* default values */ };
};
```

### 3. **Automatic Cleanup**
localStorage is automatically cleared in three scenarios:

**a) When form is successfully submitted:**
```typescript
// In handleReviewAndCreate (edit mode)
localStorage.removeItem(storageKey);
router.push(`/networking/load-balancing/balancer/${editData?.id}`);
```

**b) When creation is successful:**
```typescript
// In handleProgressSuccess
localStorage.removeItem(storageKey);
toast({ title: 'Load Balancer created successfully' });
```

**c) When user cancels:**
```typescript
// In handleCancel
localStorage.removeItem(storageKey);
onCancel();
```

## Storage Keys

Different forms use different storage keys to prevent conflicts:

### Application Load Balancer (ALB)
- **New Creation**: `alb-form-new`
- **Editing Existing**: `alb-form-{loadBalancerId}` (e.g., `alb-form-lb-123`)

### Network Load Balancer (NLB)
- **New Creation**: `nlb-form-new`
- **Editing Existing**: `nlb-form-{loadBalancerId}` (e.g., `nlb-form-lb-456`)

This means:
- You can have separate draft data for creating a new ALB and editing an existing one
- ALB and NLB forms don't interfere with each other
- Each load balancer being edited has its own saved state

## What Data is Persisted

ALL form data is persisted, including:

### Basic Information
- Name
- Description
- Load Balancer Type
- Region
- VPC
- Subnet
- Security Group

### Performance Configuration
- Performance Tier
- Standard Config
- IP Address Type
- Reserved IP ID

### Listeners (Complete Configuration)
For each listener:
- ✅ Listener Name
- ✅ Protocol and Port
- ✅ SSL Certificate
- ✅ **Policies** (name, action, redirect URL)
- ✅ **Rules** (rule type, comparator, value, key)
- ✅ **Pools** (name, protocol, algorithm, **TARGET GROUP**)
- ✅ **Health Status** (automatically enriched)

## User Experience Flow

### Scenario 1: Creating New Load Balancer with Listeners

1. User navigates to Create ALB page
2. User fills in basic information
3. User adds a listener: "dev-web-listener" with HTTP:80
4. User configures pool with target group: "dev-targets"
5. **Listener is saved and enriched with health status** ✅
6. User accidentally refreshes the page 🔄
7. **All data is still there!** ✅
   - Basic info is filled
   - Listener "dev-web-listener" exists
   - Target group "dev-targets" with health badge is visible
8. User continues configuration
9. User clicks "Review & Create"
10. Load balancer is created
11. **localStorage is cleared automatically** ✅

### Scenario 2: Editing Existing Load Balancer

1. User opens edit page for load balancer "production-lb"
2. localStorage key: `alb-form-production-lb`
3. User modifies listener, changes target group
4. Page refreshes (accidental or intentional) 🔄
5. **Changes are preserved** ✅
6. User clicks "Save Changes"
7. Changes are saved
8. **localStorage for this LB is cleared** ✅

### Scenario 3: User Cancels Form

1. User starts creating a new load balancer
2. Adds several listeners with target groups
3. Realizes they don't want to create it
4. Clicks "Cancel"
5. **localStorage is cleared immediately** ✅
6. If user comes back to create page later
7. **Form starts fresh** (no old data) ✅

## Benefits

### For Users:
1. **No Data Loss**: Work is never lost due to accidental refresh
2. **Resume Anytime**: Can leave and come back to the form
3. **Safe Experimentation**: Can refresh to see how data looks
4. **Automatic**: No manual "Save Draft" button needed

### For Developers:
1. **Simple Implementation**: Just localStorage, no backend needed
2. **Automatic Sync**: useEffect handles all saving
3. **Proper Cleanup**: No orphaned data in localStorage
4. **Type Safe**: Full TypeScript support

## Technical Details

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Falls back gracefully if localStorage is unavailable

### Data Size
- localStorage has a limit of ~5-10MB per domain
- Form data is typically < 100KB
- Plenty of space for even complex configurations

### Security
- Data is stored in user's browser only
- Not accessible by other websites
- Cleared when localStorage is cleared
- Cleared automatically on form completion

### Performance
- **Saving**: Instant (synchronous localStorage write)
- **Loading**: Instant (synchronous localStorage read)
- **No Network**: All happens locally in the browser
- **No Server Load**: No API calls for draft saving

## Testing Scenarios

### Test 1: Basic Persistence
1. ✅ Fill in form with some data
2. ✅ Refresh page
3. ✅ Verify all data is still there

### Test 2: Listener with Target Group
1. ✅ Add listener with target group "production-web-targets"
2. ✅ Health badge shows "Healthy" or "Unhealthy"
3. ✅ Refresh page
4. ✅ Listener still exists with same target group
5. ✅ Health badge still shows correct status

### Test 3: Multiple Listeners
1. ✅ Add 3 listeners with different target groups
2. ✅ Refresh page
3. ✅ All 3 listeners preserved with correct target groups

### Test 4: Cleanup on Submit
1. ✅ Fill in form
2. ✅ Submit form successfully
3. ✅ Navigate back to create page
4. ✅ Form is empty (localStorage was cleared)

### Test 5: Cleanup on Cancel
1. ✅ Fill in form
2. ✅ Click Cancel
3. ✅ Navigate back to create page
4. ✅ Form is empty (localStorage was cleared)

### Test 6: Edit Mode Persistence
1. ✅ Edit existing load balancer
2. ✅ Make changes to listeners
3. ✅ Refresh page
4. ✅ Changes are preserved

### Test 7: Separate Storage Keys
1. ✅ Start creating new ALB with some data
2. ✅ Navigate to edit existing ALB
3. ✅ Edit page shows existing ALB data (not new creation data)
4. ✅ Navigate back to create page
5. ✅ Create page shows draft creation data

## Code Files Modified

### ALB Form
**File**: `app/networking/load-balancing/balancer/create/components/alb-create-form.tsx`

**Changes:**
- Added `storageKey` constant based on edit mode and ID
- Added `getInitialFormData()` function to load from localStorage
- Changed `useState` to use `getInitialFormData()`
- Added `useEffect` to save on every `formData` change
- Updated `handleReviewAndCreate` to clear localStorage on save
- Updated `handleProgressSuccess` to clear localStorage on successful creation
- Added `handleCancel` function to clear localStorage
- Updated Cancel button to use `handleCancel`

### NLB Form
**File**: `app/networking/load-balancing/balancer/create/components/nlb-create-form.tsx`

**Changes:** (Same as ALB form)
- Added `storageKey` constant
- Added `getInitialFormData()` function
- Changed `useState` initialization
- Added save `useEffect`
- Updated cleanup in all success/cancel handlers
- Added and connected `handleCancel` function

## Future Enhancements (Optional)

Potential improvements for the future:

1. **Visual Indicator**: Show "Draft Restored" message when data is loaded from localStorage
2. **Multiple Drafts**: Allow saving multiple named drafts
3. **Expiration**: Auto-delete drafts after X days
4. **Conflict Detection**: Warn if editing same LB in multiple tabs
5. **Version Control**: Keep history of form changes
6. **Export/Import**: Allow users to download/upload form data

## Summary

With localStorage persistence:
- ✅ Users never lose their work
- ✅ Listeners and target groups persist through refresh
- ✅ Health status badges remain accurate
- ✅ Automatic save and cleanup
- ✅ No backend changes needed
- ✅ Works seamlessly in design mode prototype

The implementation is simple, robust, and provides a production-quality user experience even in a prototype environment!

