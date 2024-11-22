import { NextResponse } from 'next/server'

const API_KEY = process.env.TOM_API_KEY
const API_URL = 'https://api.up2tom.com/v3'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    const response = await fetch(`${API_URL}/models/${id}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch model details' }, { status: 500 })
  }
}

