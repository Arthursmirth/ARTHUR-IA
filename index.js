const { Client, LocalAuth } = require('whatsapp-web.js');
const { Groq } = require('groq-sdk');

// 1. TA CLÉ API GROQ ICI (Remplace entre les guillemets)
const MY_GROQ_KEY = 'MET_TA_CLE_GROQ_ICI_QUI_COMMENCE_PAR_GSK';

const groq = new Groq({ apiKey: MY_GROQ_KEY });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// 2. TON NUMÉRO DE TÉLÉPHONE ICI
client.on('qr', async () => {
    // Format : indicatif pays + numéro sans le + (ex: 2250701020304)
    const myNumber = 'TON_NUMERO_ICI'; 
    
    try {
        const pairingCode = await client.requestPairingCode(myNumber);
        console.log('-------------------------------------------');
        console.log('👉 TON CODE DE JUMELAGE WHATSAPP : ', pairingCode);
        console.log('-------------------------------------------');
    } catch (err) {
        console.error("Erreur de code :", err);
    }
});

client.on('ready', () => {
    console.log('✅ ARTHUR IA EST EN LIGNE !');
});

// 3. RÉPONSE AUTOMATIQUE
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "Tu es Arthur IA, un assistant intelligent sur WhatsApp." },
                    { role: "user", content: msg.body }
                ],
                model: "llama3-8b-8192",
            });
            await msg.reply(completion.choices.message.content);
        }
    } catch (error) {
        console.error("Erreur IA:", error);
    }
});

client.initialize();