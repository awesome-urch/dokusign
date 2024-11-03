# Zoho Sign Integration Node.js App

This simple Node.js app uses the Zoho Sign API to create and submit documents for signature. It provides two core functions:
1. **Create Document**: Sends a document to Zoho Sign for a specified user to sign.
2. **Submit Document for Signature**: Submits the created document for signature with no additional data required.

## Setup

1. **Clone this repository** and navigate to the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file and add your Zoho OAuth token:

     ```
     ZOHO_OAUTH_TOKEN=your_actual_zoho_oauth_token_here
     ```

## Project Structure

- **app.js**: Main application logic for creating and submitting documents.
- **assets/**: Folder containing the document (`sample_document.docx`) to be sent for signature.
- **views/**: Contains any EJS views if applicable.

## Usage

1. **Run the App**:

   ```bash
   nodemon app.js
   ```

2. **Endpoints**:
   - `POST /create`: Initializes document creation and sends to Zoho Sign.
   - `POST /submit/:requestId`: Submits a created document for signature.

## API Details

- **createDocument(email, name)**: Sends the document and required data to Zoho's `/requests` endpoint.
- **sendDocumentForSignature(requestId)**: Submits the document at `/requests/:requestId/submit`.
