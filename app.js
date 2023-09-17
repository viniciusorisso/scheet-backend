import express from 'express';
import fileUpload from "express-fileupload";
import path from 'path'
import fs from 'fs';

import { filesPayloadExists } from './middleware/filesPayloadExists.js';
import { fileSizeLimiter } from './middleware/fileSizeLimit.js';
import { fileExtLimiter } from './middleware/fileExtLimiter.js';

const __dirname = path.resolve();


const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post('/upload', 
  fileUpload({ createParentPath: true}),
  filesPayloadExists,
  fileExtLimiter(['.png', '.jpg', '.jpeg', '.pdf']),
  fileSizeLimiter,
  (request, response) => {
    const files = request.files;

    Object.keys(files).forEach(key => {
      const filePath = path.join(__dirname, 'files', files[key].name);

      files[key].mv(filePath, (err) => {
        if (err) return response.status(500).json({ status: 'error', message: err});
      })
    });

    return response.json({ status: 'success', message: Object.keys(files).toString() });
  }
);

app.get("/archive/:id", async (req, res) => {
  const { id } = req.params;

  const filePath = path.join(__dirname,'files' ,id + '.pdf');

  console.log(filePath);

  if(!fs.existsSync(filePath)) {
    console.log('This archive does not exist.');

    return res.status(404).json({ status: 'error', message: 'This archive does not exist.' });
  }

  const archive = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': '',
    'Content-Length': archive.size
  });

  const readStream = fs.createReadStream(filePath);

  readStream.pipe(res);
});

app.listen(PORT, () => console.log(`Listening port ${PORT}`));