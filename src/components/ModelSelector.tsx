'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectContent } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export default function ModelSelector() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedModelName, setSelectedModelName] = useState<string>('Select a model'); // To display the selected model's name
  const [inputVariables, setInputVariables] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [disabledFields, setDisabledFields] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    const response = await fetch('/api/models');
    const data = await response.json();
    setModels(data.data);
    console.log(data.data);
  };

  const handleModelSelect = async (modelId: string) => {
    const selectedModel = models.find((model) => model.id === modelId); // Find the selected model's details
    setSelectedModel(modelId);
    setSelectedModelName(selectedModel.attributes.name); // Update the selected model's name
    const response = await fetch(`/api/models/${modelId}`);
    const data = await response.json();
    console.log('Attributes');
    console.log(data.data.attributes.metadata.attributes);
    setInputVariables(data.data.attributes.metadata.attributes);
    setFormData({});
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const response = await fetch('/api/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId: selectedModel, input: formData }),
    });
    const data = await response.json();
    router.push(`/decision/${data.id}`);
  };

  function evaluateRule(rule, formData) {
    const { antecedent } = rule;

    if (Array.isArray(antecedent)) {
      // For ValueEx, evaluate all antecedent conditions
      return antecedent.every(({ index, threshold, type }) => {
        const fieldName = inputVariables[index].name; // Map index to input field name
        const fieldValue = formData[fieldName];
        if (type === 'EQ') return fieldValue === threshold;
        if (type === 'GT') return fieldValue > threshold;
        if (type === 'LT') return fieldValue < threshold;
        return false; // Add other operators as needed
      });
    } else {
      // For BlatantEx or RelationshipEx
      const { index, threshold, type } = antecedent;
      const fieldName = inputVariables[index].name; // Map index to input field name
      const fieldValue = formData[fieldName];
      if (type === 'EQ') return fieldValue === threshold;
      if (type === 'GT') return fieldValue > threshold;
      if (type === 'LT') return fieldValue < threshold;
      return false; // Add other operators as needed
    }
  }

  // function applyConsequent(rule, setFormData, setDisabledFields) {
  //   const { consequent } = rule;

  //   if (rule.type === 'BlatantEx') {
  //     // Set a result directly
  //     setFormData((prev) => ({
  //       ...prev,
  //       result: consequent.value,
  //     }));
  //   } else if (rule.type === 'ValueEx') {
  //     // Disable or modify specific fields based on the consequent
  //     consequent.forEach(({ index, threshold }) => {
  //       const fieldName = inputVariables[index].name;
  //       setFormData((prev) => ({
  //         ...prev,
  //         [fieldName]: threshold,
  //       }));
  //       setDisabledFields((prev) => ({
  //         ...prev,
  //         [fieldName]: true, // Disable the field
  //       }));
  //     });
  //   }
  // }



  return (
    <div className="max-w-xl min-w-[400px] mx-auto bg-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Select a Model</h2>
      <Select onValueChange={handleModelSelect}>
        <SelectTrigger className="w-full">
          {selectedModelName} {/* Dynamically show the selected model name */}
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.attributes.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedModel && (
        <form onSubmit={handleSubmit} className="mt-6">
          {inputVariables.map((variable) => (
            <div key={variable.name} className="mb-4">
              <label className="block text-sm font-medium">{variable.question}</label>
              {variable.type === 'Continuous' ? (
                <Input
                  type="number"
                  min={variable.domain.lower}
                  max={variable.domain.upper}
                  step={variable.domain.interval}
                  onChange={(e) => handleInputChange(variable.name, e.target.value)}
                  disabled={disabledFields[variable.name]}
                />
              ) : (
                <Select onValueChange={(value) => handleInputChange(variable.name, value)} disabled={disabledFields[variable.name]}>
                  <SelectTrigger className="w-full">{formData[variable.name] || "Select an option"}</SelectTrigger>
                  <SelectContent>
                    {variable.domain.values.map((value: string) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          <Button type="submit" className="w-full mt-4">
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}
