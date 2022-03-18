import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface MailMessage {
    to: string,
    from: string,
    subject: string,
    text: string,
    html: string
}

export default class MailService implements MailMessage {
    public to
    public from
    public subject
    public text
    public html

    constructor(to: string, subject: string, text: string) {
        this.to = to;
        this.from = process.env.SENDGRID_SENDER;
        this.subject = subject;
        this.text = text;
        this.html = text;
    }

    send() {
        return sgMail.send({
            to: this.to,
            from: this.from,
            subject: this.subject,
            text: this.text+'123test',
            html: this.text,
            trackingSettings: {
                clickTracking: {
                    enable: false,
                    enableText: false
                },
                openTracking: {
                    enable: false
                }
            }
        });
    }
}