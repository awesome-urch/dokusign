const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5500;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('assets'));

const ZOHO_BASE_URL = 'https://sign.zoho.com/api/v1';
const ZOHO_OAUTH_TOKEN = process.env.ZOHO_OAUTH_TOKEN;

// Handle file upload with multer
const upload = multer({ dest: 'uploads/' });

async function createDocument(email, name) {
    try {
        const formData = new FormData();
        formData.append('data', JSON.stringify({
            requests: {
                request_name: 'annotations',
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
                is_sequential: true,
                email_reminders: true,
                reminder_period: 0
            }
        }));
        
        formData.append('file', path.join(__dirname, 'assets/sample_document.docx'));

        const response = await axios.post(`${ZOHO_BASE_URL}/requests`, formData, {
            headers: {
                Authorization: `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data.requests.request_id;
    } catch (error) {
        console.error('Error creating document:', error);
        throw error;
    }
}

async function sendDocumentForSignature(requestId) {
    try {
        const response = await axios.post(
            `${ZOHO_BASE_URL}/requests/${requestId}/submit`,
            {},
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error sending document for signature:', error);
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
