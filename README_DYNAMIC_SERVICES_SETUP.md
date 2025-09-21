# Dynamic Services & Sessions Management Setup

This guide explains how to set up the new dynamic services and sessions management system for your AI Focus training platform.

## 🎯 What's New

### **Dynamic Configuration System**
- **Services Management**: Add, edit, delete training programs
- **Sessions Management**: Create multiple sessions for each service
- **Dynamic Pricing**: Early bird discounts, date-based pricing
- **Real-time Availability**: Live session capacity tracking
- **Admin Interface**: Easy management without code changes

### **Key Features**
- ✅ **Add New Sessions**: Create unlimited training sessions
- ✅ **Update Sessions**: Modify dates, times, capacity
- ✅ **Delete Sessions**: Remove outdated sessions
- ✅ **Dynamic Pricing**: Early bird discounts, regular pricing
- ✅ **Date-based Pricing**: Automatic price changes based on session date
- ✅ **Real-time Availability**: Live registration count updates
- ✅ **Admin Dashboard**: Full CRUD interface at `/admin`

## 🚀 Setup Instructions

### **Step 1: Run Database Migration**

```bash
# Apply the new database schema
supabase db push
```

This creates:
- `services` table - Training programs
- `sessions` table - Individual training sessions  
- `pricing_rules` table - Dynamic pricing rules
- Pricing calculation functions

### **Step 2: Access Admin Dashboard**

1. **Navigate to Admin Panel**:
   ```
   http://localhost:5173/admin
   ```

2. **Manage Services**:
   - Add new training programs
   - Set base pricing and early bird discounts
   - Configure features and session outlines
   - Enable/disable services

3. **Manage Sessions**:
   - Create multiple sessions per service
   - Set dates, times, and capacity
   - Track registration counts
   - Update session status

### **Step 3: Configure Your First Service**

1. **Go to Admin Dashboard** (`/admin`)
2. **Click "Add Service"**
3. **Fill in Service Details**:
   - **Title**: "AI Fundamentals & ChatGPT Mastery"
   - **Description**: Your training description
   - **Duration**: "3 hours"
   - **Level**: "All Levels"
   - **Format**: "Instructor-Led Training"
   - **Base Price**: $150.00
   - **Early Bird Price**: $75.00
   - **Early Bird Days**: 7
   - **Features**: One per line
   - **Session Outline**: One per line
   - **Icon**: "Brain" (Lucide icon name)
   - **Available**: ✅ Checked

4. **Click "Create"**

### **Step 4: Add Sessions**

1. **Go to "Sessions" tab**
2. **Click "Add Session"**
3. **Fill in Session Details**:
   - **Service**: Select your service
   - **Session ID**: "102501" (unique identifier)
   - **Date**: Choose session date
   - **Time**: "11:00 AM EST"
   - **Max Capacity**: 20
   - **Status**: "Active"

4. **Click "Create"**

## 💰 Pricing System

### **How Dynamic Pricing Works**

1. **Base Price**: Standard price for the service
2. **Early Bird Price**: Discounted price for early registrations
3. **Early Bird Period**: Days before session when early bird ends
4. **Automatic Calculation**: System calculates final price based on:
   - Days until session
   - Early bird rules
   - Any custom pricing rules

### **Example Pricing Logic**

```typescript
// 7+ days before session: Early Bird Price ($75)
// <7 days before session: Base Price ($150)
// Automatic calculation based on session date
```

### **Adding Custom Pricing Rules**

You can add more complex pricing rules in the database:

```sql
-- Example: Group discount for 5+ registrations
INSERT INTO pricing_rules (
  service_id, 
  rule_type, 
  discount_type, 
  discount_value, 
  min_quantity
) VALUES (
  'your-service-id',
  'group_discount',
  'percentage',
  10.00,
  5
);
```

## 🎛️ Admin Dashboard Features

### **Services Management**
- ✅ **Add Services**: Create new training programs
- ✅ **Edit Services**: Update all service details
- ✅ **Delete Services**: Remove services (cascades to sessions)
- ✅ **Pricing Control**: Set base and early bird prices
- ✅ **Feature Management**: Add/remove learning outcomes
- ✅ **Availability Toggle**: Enable/disable services

### **Sessions Management**
- ✅ **Add Sessions**: Create multiple sessions per service
- ✅ **Edit Sessions**: Update dates, times, capacity
- ✅ **Delete Sessions**: Remove individual sessions
- ✅ **Status Management**: Active, cancelled, completed
- ✅ **Capacity Tracking**: Real-time registration counts
- ✅ **Date Management**: Easy date/time selection

### **Real-time Updates**
- ✅ **Live Availability**: Registration counts update automatically
- ✅ **Dynamic Pricing**: Prices change based on session date
- ✅ **Capacity Warnings**: Visual indicators for low availability
- ✅ **Status Tracking**: Clear session status indicators

## 🔧 Technical Details

### **Database Schema**

```sql
-- Services table
services (
  id, title, description, duration, level, format,
  base_price, early_bird_price, early_bird_days,
  features[], session_outline[], icon, available
)

-- Sessions table  
sessions (
  id, service_id, session_id, date, time,
  max_capacity, current_registrations, status
)

-- Pricing rules table
pricing_rules (
  id, service_id, rule_type, discount_type,
  discount_value, min_quantity, max_quantity
)
```

### **Key Functions**

1. **`calculate_session_price()`**: Calculates dynamic pricing
2. **`update_session_availability()`**: Updates registration counts
3. **PricingService**: Frontend service for pricing logic

### **Frontend Components**

- **`/admin`**: Admin dashboard for management
- **`Services.tsx`**: Dynamic services display
- **`TrainingRegistrationForm.tsx`**: Dynamic session selection
- **`PricingService.ts`**: Pricing calculation service

## 🎨 Customization Options

### **Icons**
Use any Lucide React icon name:
- Brain, Cog, TrendingUp, Users
- Clock, CheckCircle, DollarSign
- Calendar, ArrowRight, Star

### **Pricing Display**
- Currency formatting
- Discount highlighting
- Early bird badges
- Savings calculations

### **Session Display**
- Date formatting
- Time zones
- Availability indicators
- Capacity warnings

## 🚨 Important Notes

### **Security**
- Admin dashboard has no authentication (add your own)
- Consider adding admin login for production
- Database has RLS policies for data protection

### **Performance**
- Sessions load dynamically
- Pricing calculated in real-time
- Registration counts update automatically
- Consider caching for high-traffic sites

### **Backup**
- Always backup before running migrations
- Test in development first
- Keep service data backed up

## 🎯 Next Steps

1. **Run the migration** to create the new tables
2. **Access `/admin`** to configure your services
3. **Add your first service** with pricing
4. **Create multiple sessions** for each service
5. **Test the registration flow** with dynamic pricing
6. **Customize pricing rules** as needed

## 🆘 Troubleshooting

### **Migration Issues**
```bash
# Check migration status
supabase migration list

# Reset if needed (DANGER: loses data)
supabase db reset
```

### **Admin Dashboard Not Loading**
- Check browser console for errors
- Ensure database migration completed
- Verify Supabase connection

### **Pricing Not Calculating**
- Check service has early_bird_price set
- Verify session dates are correct
- Check pricing function in database

### **Sessions Not Showing**
- Ensure sessions have "active" status
- Check session dates are in the future
- Verify service is available

---

**🎉 You now have a fully dynamic, configurable training management system!**

The system automatically handles:
- Dynamic pricing based on session dates
- Real-time availability tracking
- Easy service and session management
- Professional admin interface

No more hardcoded data - everything is now configurable through the admin dashboard!
