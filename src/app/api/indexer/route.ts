import { NextRequest, NextResponse } from 'next/server';

// Default to internal Docker service name, or localhost for local dev
const PONDER_URL = process.env.PONDER_URL || 'http://shll-indexer:42069';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Forward the GraphQL query to Ponder
        const response = await fetch(`${PONDER_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`[Indexer Proxy] Error: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: 'Indexer upstream error' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Indexer Proxy] Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
