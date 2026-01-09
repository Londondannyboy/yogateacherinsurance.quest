import { NextRequest, NextResponse } from 'next/server';
import { ZepClient } from '@getzep/zep-cloud';

// Initialize Zep client
const getZepClient = () => {
  const apiKey = process.env.ZEP_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new ZepClient({ apiKey });
};

// Ensure user exists in Zep
export async function POST(request: NextRequest) {
  try {
    const client = getZepClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Zep not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { userId, email, name, action } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Sanitize userId for Zep (remove hyphens)
    const zepUserId = userId.replace(/-/g, '');

    switch (action) {
      case 'ensure_user':
        // Try to get user, create if doesn't exist
        try {
          const user = await client.user.get(zepUserId);
          return NextResponse.json({ user, created: false });
        } catch {
          // User doesn't exist, create them
          const newUser = await client.user.add({
            userId: zepUserId,
            email: email || undefined,
            firstName: name?.split(' ')[0] || undefined,
            lastName: name?.split(' ').slice(1).join(' ') || undefined,
          });
          return NextResponse.json({ user: newUser, created: true });
        }

      case 'add_fact':
        // Add a fact to user's graph
        const { fact } = body;
        if (!fact) {
          return NextResponse.json(
            { error: 'fact is required for add_fact action' },
            { status: 400 }
          );
        }
        await client.graph.add({
          userId: zepUserId,
          type: 'text',
          data: fact,
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Zep API error:', error);
    return NextResponse.json(
      { error: error.message || 'Zep API error' },
      { status: 500 }
    );
  }
}

// Get user info
export async function GET(request: NextRequest) {
  try {
    const client = getZepClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Zep not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query param is required' },
        { status: 400 }
      );
    }

    const zepUserId = userId.replace(/-/g, '');

    try {
      const user = await client.user.get(zepUserId);
      return NextResponse.json({ user });
    } catch {
      return NextResponse.json({ user: null });
    }
  } catch (error: any) {
    console.error('Zep API error:', error);
    return NextResponse.json(
      { error: error.message || 'Zep API error' },
      { status: 500 }
    );
  }
}
