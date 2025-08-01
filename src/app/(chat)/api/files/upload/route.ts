//files/upload/route/ts
import { BlobServiceClient } from '@azure/storage-blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';

const requiredEnvVars = [
  'AZURE_STORAGE_CONNECTION_STRING',
  'AZURE_STORAGE_CONTAINER_NAME',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 15 * 1024 * 1024, {
      message: 'File size should be less than 15MB',
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
      message: 'File type should be JPEG or PNG',
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get('file') as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      // Initialize Azure Blob Service Client
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING!
      );

      // Get container client
      const containerClient = blobServiceClient.getContainerClient(
        process.env.AZURE_STORAGE_CONTAINER_NAME!
      );

      // Create blob client for the file
      const blobClient = containerClient.getBlockBlobClient(filename);

      // Upload file
      await blobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: file.type }
      });

      // Return the URL of the uploaded blob
      return NextResponse.json({
        url: blobClient.url,
        pathname: filename,
        contentType: file.type
      });
    } catch (error) {
      console.error('Azure upload error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
