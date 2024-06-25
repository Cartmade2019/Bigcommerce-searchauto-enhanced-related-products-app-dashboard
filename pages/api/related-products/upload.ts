// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
const { EXPRESS_JS_URL } = process.env;


export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, as we're handling file uploads
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
        return;
    }

    const formData = new FormData();
    const fileData = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        req.on('data', (chunk: Uint8Array) => {
            chunks.push(chunk);
        });
        req.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        req.on('error', (error) => {
            reject(error);
        });
    });

    formData.append('file', new Blob([fileData]), req.headers['file-name'] as string);

    try {
        const response = await fetch(`${EXPRESS_JS_URL}/files/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': req.headers['content-type'] as string,
            },
        });

        const result = await response.json();
        if (response.ok) {
            res.status(200).json(result);
        } else {
            res.status(response.status).json(result);
        }
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error });
    }
}