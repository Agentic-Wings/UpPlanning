const { drive } = require('../config/gdrive');
const { db } = require('../config/firebase');
const stream = require('stream');

const METADATA_COLLECTION = 'asset_metadata';

exports.uploadFile = async (req, res) => {
  if (!drive) return res.status(500).json({ error: 'Google Drive API not initialized' });
  if (!db) return res.status(500).json({ error: 'Database not initialized' });

  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files provided' });

    const { kategori, catatan } = req.body;
    const parentFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!parentFolderId) {
      return res.status(500).json({ error: 'Google Drive Root Folder ID is not configured in .env' });
    }

    const kategoriName = kategori || 'Uncategorized';

    // 1. Search if category folder already exists inside ASSET folder
    const query = `name='${kategoriName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const resList = await drive.files.list({ q: query, fields: 'files(id, name)' });
    
    let categoryFolderId;
    if (resList.data.files && resList.data.files.length > 0) {
      categoryFolderId = resList.data.files[0].id;
    } else {
      const resCreate = await drive.files.create({
        requestBody: { name: kategoriName, parents: [parentFolderId], mimeType: 'application/vnd.google-apps.folder' },
        fields: 'id'
      });
      categoryFolderId = resCreate.data.id;
    }

    // 2. Format Date and generate Post folder name
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    
    // Find existing Post folders created today to determine the post number
    const subFolderQuery = `mimeType='application/vnd.google-apps.folder' and '${categoryFolderId}' in parents and name contains '[${dateStr}]' and trashed=false`;
    const subFolderRes = await drive.files.list({ q: subFolderQuery, fields: 'files(id, name)' });
    const postNumber = subFolderRes.data.files.length + 1;
    const batchFolderName = `Post${postNumber}[${dateStr}]`;

    // 3. Create the specific Post batch folder
    const batchCreate = await drive.files.create({
      requestBody: { name: batchFolderName, parents: [categoryFolderId], mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id'
    });
    const batchFolderId = batchCreate.data.id;

    // 4. Upload all files into the batch folder
    const uploadPromises = files.map(async (file, index) => {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);

      const extension = file.originalname.split('.').pop() || 'png';
      const slideNumber = index + 1;
      const fileName = `slide${slideNumber}.${extension}`;

      const driveResponse = await drive.files.create({
        requestBody: { name: fileName, parents: [batchFolderId] },
        media: { mimeType: file.mimetype, body: bufferStream },
        fields: 'id, webViewLink, webContentLink'
      });

      return {
        fileId: driveResponse.data.id,
        url: driveResponse.data.webViewLink,
        originalName: file.originalname
      };
    });

    const uploadedResults = await Promise.all(uploadPromises);

    // Save metadata to Firebase (one document for the whole batch)
    const metadata = {
      driveFolderId: batchFolderId,
      kategori: kategori || 'Umum',
      catatan: catatan || '',
      fileCount: files.length,
      folderName: batchFolderName,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection(METADATA_COLLECTION).add(metadata);

    res.status(201).json({
      message: 'Batch files uploaded successfully',
      dbId: docRef.id,
      results: uploadedResults
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
};
