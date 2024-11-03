const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const PORT = 5500;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('assets'));

const ZOHO_BASE_URL = 'https://sign.zoho.com/api/v1';
const ZOHO_OAUTH_TOKEN = process.env.ZOHO_OAUTH_TOKEN;
// const ZOHO_OAUTH_TOKEN = '1000.aa45f1b92dffea1f80652339537a2b71.1ff85d240cffb5b591743d4085b76b85';

// Handle file upload with multer
const upload = multer({ dest: 'uploads/' });

async function createDocument(email, name) {
    try {
        console.log('Using OAuth Token:', ZOHO_OAUTH_TOKEN);

        const formData = new FormData();

        // JSON structure as a string for the `data` field
        const requestData = JSON.stringify({
            requests: {
                request_name: 'NDA',
                description: 'Details of document',
                is_sequential: true,
                actions: [
                    {
                        action_type: 'SIGN',
                        recipient_email: email,
                        recipient_name: name,
                        signing_order: 0,
                        verify_recipient: false,
                        private_notes: 'To be signed ASAP'
                    }
                ],
                expiration_days: 10,
                email_reminders: true,
                reminder_period: 0,
                notes: 'Note for all recipients'
            }
        });

        // Attach JSON string directly to `data`
        formData.append('data', requestData);

        // Attach the file as per the documentation
        formData.append('file', fs.createReadStream(path.join(__dirname, 'assets/sample_document.docx')));

        // Make the API request
        const response = await axios.post(`${ZOHO_BASE_URL}/requests`, formData, {
            headers: {
                Authorization: `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`,
                ...formData.getHeaders()
            }
        });

        console.log('Document created successfully:', response.data);

        return response.data.requests.request_id;
    } catch (error) {
        if (error.response) {
            console.error('Error creating document:', error.response.data); // Log full error details
        } else {
            console.error('Error generic:', error.message);
        }
        throw error;
    }
}


// async function sendDocumentForSignature(requestId) {
//     try {
//         console.log(`${ZOHO_BASE_URL}/requests/${requestId}/submit`);
//         // Make the API request without additional body data
//         const response = await axios.post(
//             `${ZOHO_BASE_URL}/requests/${requestId}/submit`,
//             {},  // Empty body
//             {
//                 headers: {
//                     Authorization: `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`
//                 }
//             }
//         );

//         console.log('Document submitted for signature:', response.data);
//         return response.data;
//     } catch (error) {
//         if (error.response) {
//             console.error('Error sending document for signature:', error.response.data);
//         } else {
//             console.error('Error:', error.message);
//         }
//         throw error;
//     }
// }


async function sendDocumentForSignature(requestId) {
    try {
        console.log(`${ZOHO_BASE_URL}/requests/${requestId}/submit`);
        const response = await axios.post(
            `${ZOHO_BASE_URL}/requests/${requestId}/submit`,
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`
                }
            }
        );

        console.log('Document submitted for signature:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error2 sending document for signature:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
}



// Render the signup form
app.get('/', (req, res) => {
    res.render('index');
});

// Handle form submission
app.post('/signup', upload.single('file'), async (req, res) => {
    const { name, email } = req.body;
    try {
        const requestId = await createDocument(email, name);
        await sendDocumentForSignature(requestId);
        res.redirect('/success');
    } catch (error) {
        res.status(500).send('Error processing your request. Please try again.');
    }
});

// Success page route
app.get('/success', (req, res) => {
    res.render('success');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
