export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { chatId, message } = request.body;

    if (!chatId || !message) {
        return response.status(400).json({ error: 'Missing chatId or message' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        return response.status(500).json({ error: 'Telegram Bot Token not configured' });
    }

    try {
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        const tgResponse = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            }),
        });

        const data = await tgResponse.json();

        if (!data.ok) {
            throw new Error(data.description || 'Telegram API Error');
        }

        return response.status(200).json({ success: true });
    } catch (error) {
        console.error('Telegram Notification Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
