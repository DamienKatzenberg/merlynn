import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.TOM_API_KEY
const API_URL = 'https://api.up2tom.com/v3'

export async function GET(request: NextRequest) {
    const url = new URL(request.nextUrl);
    const model = url.searchParams.get('model');
    console.log("Model ID:", model);
    try {
        const response = await fetch(`${API_URL}/batch/${model}`, {
            headers: {
                'Authorization': `Token ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json()
        console.log(data)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch model details' }, { status: 500 })
    }
}

