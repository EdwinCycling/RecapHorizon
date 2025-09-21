# Test Accounts Setup Instructions

This document provides instructions for creating test accounts for the RecapHorizon application.

## Required Test Accounts

1. **free@editsolutions.nl** - FREE tier
2. **Silver@editsolutions.nl** - SILVER tier  
3. **gold@editsolutions.nl** - GOLD tier

All accounts should use password: `Horizon1234`

## Method 1: Using Firebase Console (Recommended)

### Step 1: Create Users in Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your RecapHorizon project
3. Navigate to **Authentication** → **Users**
4. Click **Add user** for each account:
   - Email: `free@editsolutions.nl`, Password: `Horizon1234`
   - Email: `Silver@editsolutions.nl`, Password: `Horizon1234`
   - Email: `gold@editsolutions.nl`, Password: `Horizon1234`

### Step 2: Set User Data in Firestore

1. Navigate to **Firestore Database** → **Data**
2. Go to the `users` collection
3. For each user created, add/update their document with the following structure:

#### For free@editsolutions.nl:
```json
{
  "email": "free@editsolutions.nl",
  "subscriptionTier": "diamond",
  "createdAt": "[current timestamp]",
  "updatedAt": "[current timestamp]",
  "lastDailyUsageDate": "2024-01-20",
  "dailyAudioCount": 0,
  "dailyUploadCount": 0,
  "tokensMonth": "2024-01",
  "monthlyInputTokens": 0,
  "monthlyOutputTokens": 0,
  "sessionsMonth": "2024-01",
  "monthlySessionsCount": 0
}
```

#### For Silver@editsolutions.nl:
```json
{
  "email": "Silver@editsolutions.nl",
  "subscriptionTier": "silver",
  "createdAt": "[current timestamp]",
  "updatedAt": "[current timestamp]",
  "lastDailyUsageDate": "2024-01-20",
  "dailyAudioCount": 0,
  "dailyUploadCount": 0,
  "tokensMonth": "2024-01",
  "monthlyInputTokens": 0,
  "monthlyOutputTokens": 0,
  "sessionsMonth": "2024-01",
  "monthlySessionsCount": 0
}
```

#### For gold@editsolutions.nl:
```json
{
  "email": "gold@editsolutions.nl",
  "subscriptionTier": "gold",
  "createdAt": "[current timestamp]",
  "updatedAt": "[current timestamp]",
  "lastDailyUsageDate": "2024-01-20",
  "dailyAudioCount": 0,
  "dailyUploadCount": 0,
  "tokensMonth": "2024-01",
  "monthlyInputTokens": 0,
  "monthlyOutputTokens": 0,
  "sessionsMonth": "2024-01",
  "monthlySessionsCount": 0
}
```

**Note:** Replace the date values with the current date in the appropriate format.

## Method 2: Manual Account Creation (Alternative)

If you prefer to create accounts manually without using Firebase Console:

1. **Sign up normally** through your application at the registration page
2. **Use these credentials** for each account:
   - `free@editsolutions.nl` / `Horizon1234`
   - `Silver@editsolutions.nl` / `Horizon1234` 
   - `gold@editsolutions.nl` / `Horizon1234`
3. **Update subscription tiers** in Firebase Console:
   - Go to Firestore Database → users collection
   - Find each user document by email
   - Update the `subscriptionTier` field to the appropriate value

## Tier Information

### FREE Tier Limits:
- 10,000 tokens/month
- 500 tokens/day
- 15 minutes per session
- 1 session per day
- Only TXT files

### SILVER Tier Limits:
- 50,000 tokens/month
- 2,000 tokens/day
- 60 minutes per session
- 3 sessions per day
- TXT, PDF, RTF, HTML, MD, EML files

### GOLD Tier Limits:
- 150,000 tokens/month
- 6,000 tokens/day
- 90 minutes per session
- Unlimited sessions
- All file types including DOCX
- All premium features enabled

## Verification

After creating the accounts, verify they work by:
1. Logging into the application with each account
2. Checking that the correct tier is displayed in the token usage meter
3. Verifying that tier-specific features are available/restricted appropriately

## Troubleshooting

- If accounts already exist, you can reset their passwords in Firebase Console
- Make sure the `subscriptionTier` field matches exactly: `free`, `silver`, `gold` (lowercase)
- Ensure all required fields are present in the Firestore user document