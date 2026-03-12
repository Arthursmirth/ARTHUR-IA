const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { HfInference } = require('@huggingface/inference');

// 1. Initialisation Hugging Face
const hf = new HfInference(process.env.HF_TOKEN);

// 2. Initialisation Client WhatsApp avec paramètres anti-erreur Render
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
    }
});

// 3. Affichage du QR Code dans les logs Render
client.on('qr', (qr) => {
    console.log('--- SCANNEZ LE CODE CI-DESSOUS DANS LES LOGS ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ ARTHUR-IA est en ligne et prêt !');
});

// 4. Gestion des messages avec IA et Sécurité Groupes
client.on('message', async (msg) => {
    
    // SÉCURITÉ : Ignorer si c'est un groupe (@g.us)
    if (msg.from.includes('@g.us')) {
        return; 
    }

    // Réponse style ChatGPT uniquement en Privé
    try {
        console.log(`Message reçu de ${msg.from} : ${msg.body}`);

        const response = await hf.chatCompletion({
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            messages: [
                { role: "system", content: "Tu es Arthur-IA, un assistant intelligent. Réponds de manière concise et utile, comme ChatGPT." },
                { role: "user", content: msg.body }
            ],
            max_tokens: 500,
        });

        const reply = response.choices[0].message.content;
        await msg.reply(reply);

    } catch (error) {
        console.error("Erreur IA Hugging Face :", error);
        // Ne pas répondre en cas d'erreur pour éviter les boucles
    }
});

client.initialize();