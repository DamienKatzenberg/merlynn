'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ModelSelector() {
  const [models, setModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [inputVariables, setInputVariables] = useState<any[]>([])
  const [formData, setFormData] = useState({})
  const router = useRouter()

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    const response = await fetch('/api/models')
    const data = await response.json()
    setModels(data.data)
    console.log(data.data)
  }

  const handleModelSelect = async (e: { target: { value: any } }) => {
    const modelId = e.target.value
    setSelectedModel(modelId)
    const response = await fetch(`/api/models/${modelId}`)
    const data = await response.json()
    console.log("Attributes")
    console.log(data.data.attributes.metadata.attributes)
    setInputVariables(data.data.attributes.metadata.attributes)
    setFormData({})
  }

  const handleInputChange = (e: { target: { name: any; value: any; type: string } }) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value, // Convert to number if input type is 'number'
    })
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const response = await fetch('/api/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId: selectedModel, input: formData }),
    })
    const data = await response.json()
    router.push(`/decisions`)
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Select a Model</h2>
      <select
        className="w-full p-2 border rounded mb-4"
        onChange={handleModelSelect}
        value={selectedModel}
      >
        <option value="">Select a model</option>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.attributes.name}
          </option>
        ))}
      </select>
      {inputVariables.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {inputVariables.map((variable) => (
            <div key={variable.name}>
              <label className="block text-sm font-medium text-gray-700">
                {variable.question}
              </label>
              {variable.type === 'Continuous' ? (
                <input
                  type="number"
                  name={variable.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded"
                  min={variable.domain.lower} // Set 'min' for continuous
                  max={variable.domain.upper} // Set 'max' for continuous
                  step={variable.domain.interval} // Set 'step' for continuous
                  required
                />
              ) : (
                // Nominal input as a dropdown
                <select
                  name={variable.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded"
                  defaultValue="" // Default placeholder
                  required
                >
                  {/* Default placeholder option */}
                  <option value="" disabled>
                    Select an option
                  </option>
                  {/* Map through predefined options */}
                  {variable.domain.values.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Get Decision
          </button>
        </form>
      )}
    </div>
  )
}
