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
  const [disabledFields, setDisabledFields] = useState<Record<string, boolean>>({});
  const [exclusions, setExclusions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    const response = await fetch('/api/models');
    const data = await response.json();
    console.log(data.data)
    setModels(data.data);
  };

  const handleModelSelect = async (modelId: string) => {
    const selectedModel = models.find((model) => model.id === modelId); // Find the selected model's details
    setSelectedModel(modelId);
    setSelectedModelName(selectedModel.attributes.name); // Update the selected model's name
    setExclusions(selectedModel.attributes.exclusions.rules);
    const response = await fetch(`/api/models/${modelId}`);
    const data = await response.json();
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
      router.push(`/decisions`);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occured while submitting. Please try again",
      })
    }
  };


  function evaluateRule(rule: { type?: any; relation?: any; antecedent?: any; }, formData: { [x: string]: any; }) {
    const { antecedent } = rule;

    if (Array.isArray(antecedent)) {
      // For ValueEx, evaluate all antecedent conditions
      return antecedent.every(({ index, threshold, type }) => {
        const fieldName = inputVariables[index].name; // Map index to input field name
        const fieldValue = formData[fieldName];
        if (fieldValue === undefined || fieldValue === null) return false;
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
        if (fieldValue === undefined || fieldValue === null) return false;
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
        if (fieldValue === undefined || fieldValue === null) return false;
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

  function applyConsequent(rule: { type?: any; consequent?: any; }, setFormData: { (value: SetStateAction<Record<string, any>>): void; (arg0: { (prev: any): any; (prev: any): any; (prev: any): any; }): void; }, setDisabledFields: { (value: SetStateAction<{}>): void; (arg0: (prev: any) => any): void; }) {
    const { consequent } = rule;

    if (rule.type === 'BlatantEx') {
      // Directly set a result for BlatantEx rules
      setFormData((prev: any) => ({
        ...prev,
        result: consequent.value,
      }));
    } else if (rule.type === 'ValueEx') {
      // Track updated disabled fields separately to avoid unintended changes
      const updatedDisabledFields: { [key: string]: boolean } = {};

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
              [fieldName]: currentValue === threshold ? '' : currentValue, // Clear if equal to threshold
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
              <p>Discrete: {variable.domain.discrete ? 'Yes' : 'No'}</p>
              {variable.type === 'Continuous' ? (
                <Input
                  type="number"
                  min={variable.domain.lower}
                  max={variable.domain.upper}
                  step={variable.domain.discrete ? variable.domain.interval : "any"} // Use "any" for non-discrete inputs
                  onInput={(e) => {
                    // Prevent invalid input for discrete variables
                    const value = parseFloat(e.currentTarget.value);
                    if (variable.domain.discrete && value % variable.domain.interval !== 0) {
                      e.currentTarget.value = (Math.round(value / variable.domain.interval) * variable.domain.interval).toString();
                    }
                  }}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      handleInputChange(variable.name, value);
                    }
                  }}
                  disabled={disabledFields[variable.name]}
                />


              ) : (
                <Select onValueChange={(value) => handleInputChange(variable.name, value)} disabled={disabledFields[variable.name]} value={formData[variable.name]}>
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
