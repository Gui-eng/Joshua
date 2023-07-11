import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { input } = req.body;

        const pythonProcess = spawn('python', ['./public/si.py', input]);

        pythonProcess.stdout.on('data', (data) => {
            const result = data.toString();
            res.status(200).json({ result });
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
            res.status(500).json({ error: 'An error occurred' });
        });
    } else {
        res.status(403).json({ error: 'Forbidden' });
    }
}
