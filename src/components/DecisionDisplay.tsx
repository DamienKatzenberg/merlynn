'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DecisionDisplay({ decisionId }: { decisionId: string }) {
  const [decision, setDecision] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (decisionId) {
      fetchDecision()
    }
  }, [decisionId])

  const fetchDecision = async () => {
    const response = await fetch(`/api/decision/${decisionId}`)
    const data = await response.json()
    setDecision(data)
  }

  if (!decision) {
    return null
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Decision Result</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
        {JSON.stringify(decision, null, 2)}
      </pre>
      <button
        onClick={() => router.push('/')}
        className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Back to Model Selection
      </button>
    </div>
  )
}

