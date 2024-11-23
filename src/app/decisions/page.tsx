import { connectToDatabase } from '../../lib/mongodb'

export default async function Decisions() {
  const { db } = await connectToDatabase()
  const decisions = await db.collection('decisions').find({}).sort({ timestamp: -1 }).toArray()

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Stored Decisions</h2>
      {decisions.map((decision) => (
        <div key={decision._id.toString()} className="bg-card shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2 text-card-foreground">
            Model ID: {decision.modelId}
          </h3>
          <h4 className="text-lg font-medium mb-2 text-card-foreground">Inputs:</h4>
          <pre className="bg-muted p-4 rounded overflow-x-auto mb-4 text-muted-foreground">
            {JSON.stringify(decision.input, null, 2)}
          </pre>
          <h4 className="text-lg font-medium mb-2 text-card-foreground">Decision:</h4>
          <pre className="bg-muted p-4 rounded overflow-x-auto text-muted-foreground">
            {JSON.stringify(decision.decision.data.attributes.decision, null, 2)}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">
            Timestamp: {new Date(decision.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );

}

