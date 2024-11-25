"use client";

import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Batch() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");

    useEffect(() => {
        fetchJobs();
    }, [selectedModel]);

    const fetchJobs = async () => {
        try {
            const response = await fetch("/api/batch?model=" + selectedModel);
            const data = await response.json();
            setJobs(data.data.files);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleDownload = async (selectedModel: string, jobId: string) => {
        try {
            const response = await fetch(`/api/batch/${jobId}?model=${selectedModel}`);

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            // Convert the response to a Blob
            const blob = await response.blob();

            // Create a temporary URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element for the download
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${jobId}.csv`); // Specify the file name
            document.body.appendChild(link);
            link.click();

            // Cleanup the temporary link
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url); // Release the Blob URL
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };


    return (
        <div className="flex flex-col justify-center items-center mt-20 bg-background text-foreground">
            {/* File Upload Component */}
            <FileUpload setCurrentlySelectedModel={setSelectedModel} />

            {/* Jobs Section */}
            <div className="mt-10 bg-card rounded-lg w-full max-w-2xl p-4">
                <h2 className="text-xl font-semibold mb-4">Completed Jobs</h2>
                {jobs && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                        <div key={job.id} className="flex items-center justify-between mr-4">
                            <div className="bg-card shadow-md rounded-lg p-6 mb-4">
                                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                                    Job ID: {job.id}
                                </h3>
                                <h4 className="text-lg font-medium mb-2 text-card-foreground">
                                    File: {job.filename || "N/A"}
                                </h4>
                                <h4 className="text-lg font-medium mb-2 text-card-foreground">
                                    Timestamp: {new Date(job.timestamp).toLocaleString()}
                                </h4>
                            </div>
                            <Button onClick={() => handleDownload(selectedModel, job.id)}>Download</Button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground">No jobs found.</p>
                )}
            </div>
        </div>
    );
}
