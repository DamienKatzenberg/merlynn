'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { toast } from '@/hooks/use-toast';

export default function FileUpload({ setCurrentlySelectedModel }: { setCurrentlySelectedModel: (modelId: string) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [models, setModels] = useState<any[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedModelName, setSelectedModelName] = useState<string>('Select a model'); // To display the selected model's name

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        const response = await fetch('/api/models');
        const data = await response.json();
        setModels(data.data);
    };

    const handleModelSelect = async (modelId: string) => {
        const selectedModel = models.find((model) => model.id === modelId); // Find the selected model's details
        setSelectedModel(modelId);
        setSelectedModelName(selectedModel.attributes.name); // Update the selected model's name
        setCurrentlySelectedModel(modelId);
        const response = await fetch(`/api/models/${modelId}`);
        const data = await response.json();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            toast({
                title: "Invalid File",
                description: "Please select a file before uploading",
            })
            return;
        }

        if (!file.name.endsWith('.csv')) {
            toast({
                title: "Invalid File",
                description: "Invalid file type. Please upload a CSV file.",
            })
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        try {
            const response = await fetch(`/api/batch/${selectedModel}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error uploading file: ${response.statusText}`);
            }

            const result = await response.json();
            toast({
                title: "Success",
                description: "File uploaded successfully.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload file. Please try again",
            })
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    return (
        <div className="max-w-2xl w-full mx-auto bg-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Choose A Model</h2>
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
            <div className='mt-4'>
                <h2 className="text-xl font-semibold mb-4">Upload Batch File</h2>
                <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full mb-4"
                />
                <Button
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="w-full"
                >
                    {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
            </div>
        </div>
    );
}
