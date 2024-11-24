'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectContent } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function ModelSelector() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedModelName, setSelectedModelName] = useState<string>('Select a model'); // To display the selected model's name
  const [inputVariables, setInputVariables] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [disabledFields, setDisabledFields] = useState({});
  const [exclusions, setExclusions] = useState<any[]>([]);
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
    setExclusions(selectedModel.attributes.exclusions.rules);
    const response = await fetch(`/api/models/${modelId}`);
    const data = await response.json();
    console.log('Attributes');
    console.log(data.data.attributes.metadata.attributes);
    setInputVariables(data.data.attributes.metadata.attributes);
    setFormData({});
  };

  const handleInputChange = (name: string, value: any) => {
    // Update formData with the new value
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Track which fields should remain disabled
    const updatedDisabledFields = {};

    // Evaluate all exclusion rules
    exclusions.forEach((rule) => {
      if (evaluateRule(rule, updatedFormData)) {
        console.log("Rule matched: ", rule);
        applyConsequent(rule, setFormData, setDisabledFields);
      }
    });
  };


  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Check if all fields are filled
    const allFieldsFilled = inputVariables.every((variable) => {
      const value = formData[variable.name];
      return value !== undefined && value !== null && value !== ''; // Ensure value is not empty
    });

    if (!allFieldsFilled) {
      // Trigger error toast if validation fails
      toast({
        title: "Error",
        description: "Please fill in all required fields before submitting.",
      })
      return;
    }

    try {
      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: selectedModel, input: formData }),
      });
      const data = await response.json();
      router.push(`/decision/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occured while submitting. Please try again",
      })
    }
  };


  function evaluateRule(rule, formData) {
    const { antecedent } = rule;

    if (Array.isArray(antecedent)) {
      // For ValueEx, evaluate all antecedent conditions
      return antecedent.every(({ index, threshold, type }) => {
        const fieldName = inputVariables[index].name; // Map index to input field name
        const fieldValue = formData[fieldName];
        if (type === 'EQ') return fieldValue === threshold;
        if (type === 'NEQ') return fieldValue !== threshold;
        if (type === 'GTEQ') return fieldValue >= threshold;
        if (type === 'GT') return fieldValue > threshold;
        if (type === 'LTEQ') return fieldValue <= threshold;
        if (type === 'LT') return fieldValue < threshold;
        return false; // Add other operators as needed
      });
    } else {
      // For BlatantEx or RelationshipEx
      if (rule.type === 'RelationshipEx') {
        const { index, threshold, type } = rule.relation;
        const fieldName = inputVariables[index].name; // Map index to input field name
        const fieldValue = formData[fieldName];
        if (type === 'EQ') return fieldValue === threshold;
        if (type === 'NEQ') return fieldValue !== threshold;
        if (type === 'GTEQ') return fieldValue >= threshold;
        if (type === 'GT') return fieldValue > threshold;
        if (type === 'LTEQ') return fieldValue <= threshold;
        if (type === 'LT') return fieldValue < threshold;
        return false; // Add other operators as needed
      } else {
        const { index, threshold, type } = antecedent;
        const fieldName = inputVariables[index].name; // Map index to input field name
        const fieldValue = formData[fieldName];
        if (type === 'EQ') return fieldValue === threshold;
        if (type === 'NEQ') return fieldValue !== threshold;
        if (type === 'GTEQ') return fieldValue >= threshold;
        if (type === 'GT') return fieldValue > threshold;
        if (type === 'LTEQ') return fieldValue <= threshold;
        if (type === 'LT') return fieldValue < threshold;
        return false; // Add other operators as needed
      }
    }
  }

  function applyConsequent(rule, setFormData, setDisabledFields) {
    const { consequent } = rule;

    if (rule.type === 'BlatantEx') {
      // Directly set a result for BlatantEx rules
      setFormData((prev: any) => ({
        ...prev,
        result: consequent.value,
      }));
    } else if (rule.type === 'ValueEx') {
      // Track updated disabled fields separately to avoid unintended changes
      const updatedDisabledFields = {};

      consequent.forEach(({ index, threshold, type }: { index: number; threshold: any; type: string }) => {
        const fieldName = inputVariables[index]?.name;

        if (type === 'EQ') {
          // Set the field to the specified value and disable it
          setFormData((prev: any) => ({
            ...prev,
            [fieldName]: threshold,
          }));
          updatedDisabledFields[fieldName] = true;
        } else if (type === 'NEQ') {
          // Ensure the field is not equal to the specified value
          setFormData((prev: any) => {
            const currentValue = prev[fieldName];
            return {
              ...prev,
              [fieldName]: currentValue === threshold ? 'Select an option' : currentValue, // Clear if equal to threshold
            };
          });
          updatedDisabledFields[fieldName] = false; // Ensure the field remains enabled
        }
      });

      // Apply the updated disabled fields
      setDisabledFields((prev: any) => ({
        ...prev,
        ...updatedDisabledFields,
      }));
    }
  }

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
