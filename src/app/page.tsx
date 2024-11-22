import ModelSelector from '../components/ModelSelector'
import DecisionDisplay from '../components/DecisionDisplay'

export default function Home() {
  return (
    <div className="space-y-8">
      <ModelSelector />
      <DecisionDisplay decisionId={""} />
    </div>
  )
}

