# Firebase Security Rules Deployment Guide

## Overview
This guide explains how to deploy the Firebase security rules that have been implemented to protect your RecapHorizon application.

## Files Created
- `firestore.rules` - Database security rules
- `storage.rules` - File storage security rules
- `firebase.json` - Firebase configuration with security headers
- `firestore.indexes.json` - Database indexes for optimal performance

## Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized
3. Authenticated with Firebase: `firebase login`

## Deployment Steps

### 1. Initialize Firebase (if not already done)
```bash
firebase init
```
Select:
- Firestore
- Hosting
- Storage

### 2. Deploy Security Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 3. Deploy with Security Headers
```bash
# Deploy hosting with security headers
firebase deploy --only hosting
```

### 4. Verify Deployment
```bash
# Check Firestore rules
firebase firestore:rules:get

# Check Storage rules
firebase storage:rules:get
```

## Security Features Implemented

### Firestore Security Rules
- **User Data Isolation**: Users can only access their own data
- **Authentication Required**: All operations require valid authentication
- **Input Validation**: Email formats, timestamps, and required fields validated
- **Waitlist Protection**: Email collection with privacy controls
- **Admin Restrictions**: Admin collections completely server-side only

### Storage Security Rules
- **File Type Validation**: Only allowed file types (audio, images, documents)
- **Size Limits**: Enforced file size limits (5MB-200MB depending on type)
- **User Isolation**: Users can only access their own files
- **Temporary Files**: Auto-cleanup for temporary uploads

### Security Headers (via firebase.json)
- **Content Security Policy**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer Policy**: Controls referrer information

## Testing Security Rules

### Local Testing with Emulators
```bash
# Start Firebase emulators
firebase emulators:start

# Test rules with emulator UI
# Visit: http://localhost:4000
```

### Production Testing
1. Test with authenticated user
2. Test with unauthenticated requests (should fail)
3. Test cross-user access (should fail)
4. Verify file upload restrictions

## Monitoring and Maintenance

### Security Monitoring
- Monitor Firebase Console for security events
- Review Firestore usage patterns
- Check for unusual access patterns

### Regular Updates
- Review rules quarterly
- Update based on new features
- Monitor Firebase security best practices

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check authentication and user ownership
2. **Index Missing**: Deploy firestore indexes
3. **File Upload Fails**: Check file type and size limits

### Debug Commands
```bash
# Check current rules
firebase firestore:rules:get

# Validate rules syntax
firebase firestore:rules:validate

# Check indexes
firebase firestore:indexes
```

## Security Checklist
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Indexes deployed
- [ ] Security headers configured
- [ ] Authentication working
- [ ] User isolation tested
- [ ] File upload restrictions tested
- [ ] Admin access restricted
- [ ] Monitoring enabled

## Next Steps
1. Deploy rules to production
2. Test all functionality
3. Monitor security logs
4. Set up alerts for security events
5. Regular security reviews

## Support
For issues with deployment or security rules, refer to:
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)