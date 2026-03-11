require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const { HfInference } = require('@huggingface/inference');
const qrcode = require('qrcode-terminal');

// 1. Initialisation IA
const hf = new HfInference(process.env.HF_TOKEN);

// 2. CONFIGURATION SPÉCIALE TERMUX (Très important)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Ce chemin est obligatoire pour trouver Chrome sur Android/Termux
        executablePath: '/data/data/com.termux/files/usr/bin/chromium', 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
    }
});

// 3. Connexion (QR Code + Jumelage)
client.on('qr', async (qr) => {
    qrcode.generate(qr, { small: true });
    try {
        const pairingCode = await client.requestPairingCode(process.env.MY_NUMBER);
        console.log('-------------------------------------------');
        console.log('👉 CODE DE JUMELAGE : ', pairingCode);
        console.log('-------------------------------------------');
    } catch (err) {
        console.error("Erreur jumelage :", err);
    }
});

client.on('ready', () => {
    console.log('✅ ARTHUR13 EST EN LIGNE SUR TERMUX !');
});

// 4. Réponse IA
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) {
            const response = await hf.chatCompletion({
                model: "meta-llama/Meta-Llama-3-8B-Instruct",
                messages: [
                    { role: "system", content: "Tu es Arthur IA, un assistant intelligent sur WhatsApp." },
                    { role: "user", content: msg.body }
                ],
                max_tokens: 500,
            });

            const replyText = response.choices.message.content;
            await msg.reply(replyText);
        }
    } catch (error) {
        console.error("Erreur IA:", error.message);
    }
});

client.initialize();