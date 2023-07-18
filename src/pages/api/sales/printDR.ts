import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { input } = req.body;
        let result = '';
        let errorOccurred = false;

        const pythonProcess = spawn('python', ['./public/dr.py', input]);

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
            errorOccurred = true;
        });

        pythonProcess.on('exit', (code) => {
            if (errorOccurred) {
                res.status(500).json({ error: 'An error occurred' });
            } else {
                res.status(200).json({ result });
            }
        });
    } else {
        res.status(403).json({ error: 'Forbidden' });
    }
}
