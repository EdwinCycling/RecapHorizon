# RecapSmart Firebase Scripts

Utility scripts for managing RecapSmart's Firebase configuration.

## Initialize Model Configuration in Firestore

This script creates the `settings/modelConfig` document in Firestore with default model mappings.

### Setup

1. **Install Dependencies**
   ```bash
   cd scripts
   npm install
   ```

2. **Run the Script**
   ```bash
   npm run init-models
   ```

   The script automatically uses your existing Firebase configuration from the project's `.env` file.

### What the Script Does

- Creates a `settings` collection in Firestore (if it doesn't exist)
- Adds a `modelConfig` document with default model mappings:
  - `audioTranscription`: gemini-2.5-flash
  - `expertChat`: gemini-2.5-flash-lite
  - `emailComposition`: gemini-2.5-flash-lite
  - `analysisGeneration`: gemini-2.5-flash
  - `pptExport`: gemini-2.5-flash
  - `businessCase`: gemini-2.5-flash
  - `sessionImport`: gemini-2.5-flash-lite
  - `generalAnalysis`: gemini-2.5-flash
- Adds metadata fields (`updatedBy`, `updatedAt`, `createdAt`)

### After Running

1. **Verify in Firebase Console**
   - Go to Firestore Database
   - Navigate to `settings` > `modelConfig`
   - Confirm the document was created with the expected structure

2. **Use in Admin Application**
   - The document is now available at path: `settings/modelConfig`
   - You can read/write this document from your admin application
   - Any changes will be automatically picked up by the main RecapSmart application

### Troubleshooting

- **Missing Environment Variables**: Ensure your `.env` file in the project root contains all required Firebase variables
- **Authentication Error**: Verify your Firebase configuration in the `.env` file is correct
- **Permission Error**: Check Firestore security rules allow writes to `settings` collection
- **Network Error**: Verify internet connection and Firebase project status
- **Module Error**: Run `npm install` in the scripts directory

### Security Notes

- The script uses the same secure environment variables as your main application
- Keep your `.env` file secure and never commit it to version control
- Review Firestore security rules to ensure appropriate access controls