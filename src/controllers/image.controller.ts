import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 } from 'uuid';

const imageController = Router();

const directoryPath = '/vault';

const establishDirectory = (request: Request, response: Response, next: NextFunction) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(`.${directoryPath}`, { recursive: true });
  }
  next();
};

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, `.${directoryPath}`);
  },
  filename: (request, file, callback) => {
    callback(null, `${v4()}.jpg`);
  },
});

const upload = multer({ storage });

imageController.post('/upload', establishDirectory, upload.single('file'), uploadImage);
imageController.get('/get', getImage);
imageController.get('/list', listImageNames);

async function uploadImage(request: Request, response: Response) {
  try {
    response.status(202).json(request.file?.filename.replace('.jpg', ''));
  } catch (error) {
    response.status(500).json(error);
  }
}

async function listImageNames(request: Request, response: Response) {
  try {
    fs.readdir(`.${directoryPath}`, (err, files) => {
      if (err) {
        return response.status(500).json({ error: err.message });
      }
      files = files.map((file) => file.replace('.jpg', ''));
      response.status(200).json({ files });
    });
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getImage(request: Request, response: Response) {
  try {
    const filePath = path.resolve(__dirname, `../..${directoryPath}`, `${request.query.filename as string}.jpg`);

    console.log(filePath)
    if (!fs.existsSync(filePath)) {
      response.status(404).send('File not found');
      return;
    }
    response.status(200).sendFile(filePath);
  } catch (error) {
    console.log(error)
    response.status(500).json(error);
  }
}

export default imageController;
