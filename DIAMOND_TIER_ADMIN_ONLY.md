# 💎 Diamond Tier - Admin Only Configuration

## Overview
The Diamond tier in RecapHorizon is **exclusively reserved for administrators** and is not available for public purchase through Stripe. This tier provides unlimited access to all premium features and is managed manually by administrators.

## 🔒 Admin-Only Access

### Why Diamond is Admin-Only
- **Administrative Control**: Diamond tier provides unrestricted access to all features
- **Cost Management**: No billing/payment processing required for internal admin accounts
- **Security**: Prevents unauthorized access to unlimited features
- **Support**: Admins can provide premium support without subscription limitations

### Configuration Details

#### Stripe Configuration
- **No Stripe Price ID**: Diamond tier intentionally has no Stripe price ID configured
- **Not in Public Pricing**: Filtered out from public pricing comparisons
- **Manual Assignment**: Tier must be assigned manually in the database

#### Subscription Service Configuration
```typescript
[SubscriptionTier.DIAMOND]: {
  price: 0,           // Free for admins
  currency: 'EUR',
  billingPeriod: 'month',
  minTerm: 0,         // No minimum term
  cancelable: false   // Cannot be cancelled (admin-managed)
}
```

#### Feature Access
```typescript
[SubscriptionTier.DIAMOND]: {
  chat: true,              // ✅ Chat with transcript
  exportPpt: true,         // ✅ PowerPoint export
  businessCase: true,      // ✅ Business case generator
  webPage: true,           // ✅ Web page analysis
  webExpert: true,         // ✅ Web expert chat
  multipleUrls: true       // ✅ Multiple URL processing
}
```

#### Tier Limits
```typescript
[SubscriptionTier.DIAMOND]: {
  maxTokensPerMonth: -1,        // ♾️ Unlimited
  maxTokensPerDay: -1,          // ♾️ Unlimited
  maxSessionDuration: -1,       // ♾️ Unlimited
  maxSessionsPerDay: -1,        // ♾️ Unlimited
  maxTranscriptLength: -1,      // ♾️ Unlimited
  allowedFileTypes: [           // 📁 All file types
    'txt', 'pdf', 'rtf', 'html', 'md', 'eml'
  ]
}
```

## 🛠️ Implementation Details

### Public Pricing Exclusion
The `getTierComparison()` method automatically filters out Diamond tier:
```typescript
public getTierComparison() {
  // Hide DIAMOND from pricing comparison (only for admins)
  return Object.values(SubscriptionTier)
    .filter(t => t !== SubscriptionTier.DIAMOND)
    .map(tier => ({ /* ... */ }));
}
```

### Admin-Only Pricing Display
For admin interfaces, use `getTierComparisonForAdmin()` to include Diamond tier.

### Localization
All language files include the admin-only designation:
- **Dutch**: "Diamond Tier is exclusief voor admins en biedt alle functionaliteiten."
- **English**: "Diamond Tier is exclusive for admins and provides all functionalities."
- **Other languages**: Similar translations available

## 🔧 Manual Assignment Process

### How to Assign Diamond Tier
1. **Database Access**: Direct database modification required
2. **User Record**: Update user's `subscriptionTier` field to `DIAMOND`
3. **Subscription Status**: Set `subscriptionStatus` to `active`
4. **No Stripe Customer**: No Stripe customer record needed

### Example Database Update
```javascript
// Firestore example
db.collection('users').doc(userId).update({
  subscriptionTier: 'DIAMOND',
  subscriptionStatus: 'active',
  // No stripeCustomerId needed
});
```

## 🚫 What NOT to Do

### ❌ Do NOT Add Stripe Price ID
- Diamond tier should never have a Stripe price ID
- This would make it publicly purchasable
- Defeats the purpose of admin-only access

### ❌ Do NOT Include in Public Pricing
- Keep Diamond filtered out of public pricing displays
- Only show in admin interfaces when necessary

### ❌ Do NOT Allow Self-Service Upgrade
- Users cannot upgrade themselves to Diamond
- Must be manually assigned by administrators

## 📋 Verification Checklist

- [ ] Diamond tier has no Stripe price ID in `stripeService.ts`
- [ ] Diamond tier is filtered out in `getTierComparison()`
- [ ] Diamond tier has unlimited limits in `TIER_LIMITS`
- [ ] Diamond tier has all features enabled in `TIER_FEATURES`
- [ ] Diamond tier pricing is set to 0 in `TIER_PRICING`
- [ ] Localization includes admin-only messaging
- [ ] No public upgrade buttons for Diamond tier

## 🔍 Security Considerations

### Access Control
- Diamond tier assignment requires database-level access
- No API endpoints should allow Diamond tier assignment
- Admin interfaces should be properly secured

### Audit Trail
- Log all Diamond tier assignments
- Track admin actions for compliance
- Monitor for unauthorized tier changes

## 📞 Support

For questions about Diamond tier configuration or admin access:
- Contact: support@recaphorizon.nl
- Internal documentation: Check admin security guides
- Database access: Requires administrator privileges

---

**Last Updated**: December 2024  
**Status**: ✅ Properly Configured - Admin Only  
**Stripe Integration**: ❌ Intentionally Not Configured