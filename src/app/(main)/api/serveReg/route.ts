//@ts-nocheck
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { CSearch } from '@/lib/db/models';
import dbConnect from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await dbConnect();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const content = await CSearch.findOne({}, { Keys: 1, _id: 0 });
  
    if (!content) {
      console.log(content);
      return new Response('Search keys not found', { status: 404 });
    }

    return Response.json({content: content}, { status: 200 });
  } catch (error) {
    console.error('Error fetching regulations:', error);
    
    return new Response('Internal Server Error', { status: 500 });
  }
}