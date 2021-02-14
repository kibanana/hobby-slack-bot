import FormData from 'form-data';
import fetch from 'node-fetch';
const { API_TOKEN, CHANNEL } = process.env;

export default async (image: Buffer | null): Promise<boolean> => {
    try {
        const currentDate = new Date().toISOString();

        const form = new FormData();
        form.append('channels', CHANNEL);
        form.append('token', API_TOKEN);
        form.append('filename', `hobby-info-image-${currentDate}`);
        form.append('filetype', 'image/png');
        form.append('title', `hobby-info-image-${currentDate}.png`);
        form.append('initial_comment', currentDate);
        form.append('file', image, {
            contentType: 'text/plain',
            filename: `hobby-info-image-${currentDate}`
        });
    
        const res = await fetch('https://slack.com/api/files.upload', {
            method: 'POST',
            body: form,
            headers: Object.assign(form.getHeaders(), { 'Content-Type': 'multipart/form-data' })
        });
    
        if (!res.ok) {
            return false;
        }
        
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};
