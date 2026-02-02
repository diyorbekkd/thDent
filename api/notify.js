export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chatId, message } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!chatId || !message) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const BOT_TOKEN = '7904975097:AAE8YYwzYyHo0HTjMDU2v19ktxhIJHJQGWU';

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            }),
        });

        const data = await response.json();

        if (data.ok) {
            return res.status(200).json({ success: true });
        } else {
            console.error('Telegram API Error:', data);
            return res.status(500).json({ error: 'Failed to send message', details: data });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
