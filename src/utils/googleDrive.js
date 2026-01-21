import { google } from "googleapis";
import { PassThrough } from "stream";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

export async function uploadPdfToDrive(pdfBuffer, fileName, folderId) {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("uploadPdfToDrive: pdfBuffer is not a Buffer");
  }

  const stream = new PassThrough();
  stream.end(pdfBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: "application/pdf",
      body: stream,
    },
    supportsAllDrives: true,
  });

  return {
    fileId: response.data.id,
    viewUrl: `https://drive.google.com/file/d/${response.data.id}/view`,
  };
}
