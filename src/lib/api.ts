export async function sendTelegramNotification(chatId: string, message: string) {
    try {
        const response = await fetch('/api/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatId, message }),
        });

        if (!response.ok) {
            console.error('Failed to send notification:', await response.text());
        }
    } catch (error) {
        console.error('Notification Error:', error);
    }
}
