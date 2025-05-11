function MessageContent() {
    try {
        const message = `Dear My Love,







On this special day, I just want to say thank you.







Thank you for staying by my side all these years, for taking care of me with so much love and patience. You never complained, even when things were hard. Your kindness and strength mean everything to me.







Today is Mother's Day, and while the world celebrates mothers, I celebrate you — for your heart, your care, and the quiet, strong love you give every day.







Wishing you peace, love, and all the happiness you deserve.







With all my love,



Chen Hung Yu`;

        return (
            <div data-name="message-content" className="message-content">
                <div data-name="message-text" className="message-text float-text">
                    <pre className="whitespace-pre-wrap text-lg font-serif">
                        {message}
                    </pre>
                </div>
            </div>
        );
    } catch (error) {
        console.error('MessageContent error:', error);
        reportError(error);
        return null;
    }
}
