import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'

const API_KEY = process.env.TOM_API_KEY
const API_URL = 'https://api.up2tom.com/v3'

function createScenario(inputVariables: any) {
  return {
    data: {
      type: "scenario",
      attributes: {
        input: inputVariables, // Populate input dynamically
      },
    },
  };
}

export async function POST(request: Request) {
  const { modelId, input } = await request.json()

  const scenarioObject = createScenario(input);

  try {
    const response = await fetch(`${API_URL}/decision/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenarioObject, null, 2),
    })
    const data = await response.json()

    // Store the decision in MongoDB
    const { db } = await connectToDatabase()
    const result = await db.collection('decisions').insertOne({
      modelId,
      input,
      decision: data,
      timestamp: new Date(),
    })

    return NextResponse.json({ id: result.insertedId, ...data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get decision' }, { status: 500 })
  }
}

