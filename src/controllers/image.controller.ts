import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 } from 'uuid';

const imageController = Router();

const directoryPath = '/vault';

const establishDirectory = (request: Request, response: Response, next: NextFunction) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  next();
};

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, `${directoryPath}`);
  },
  filename: (request, file, callback) => {
    callback(null, `${v4()}.jpg`);
  },
});

const upload = multer({ storage });

imageController.post('/upload', establishDirectory, upload.single('file'), uploadImage);
imageController.get('/get', getImage);

async function uploadImage(request: Request, response: Response) {
  try {
    response.status(202).json(request.file?.filename);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getImage(request: Request, response: Response) {
  try {
    const filePath = path.join(directoryPath, `${request.query.filename as string}.jpg`);

    if (!fs.existsSync(filePath)) {
      response.status(404).send('File not found');
      return;
    }

    response.status(200).sendFile(filePath);
  } catch (error) {
    response.status(500).json(error);
  }
}

export default imageController;
