import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const url = new URL(req.nextUrl);
    const model = url.searchParams.get("model");

    if (!id || !model) {
        return NextResponse.json({ error: "Job ID and model are required" }, { status: 400 });
    }

    try {
        // Fetch the file from the Up2Tom API
        const response = await fetch(`https://api.up2tom.com/v3/batch/${model}/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Token ${process.env.TOM_API_KEY}`,
            },
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            return NextResponse.json(
                { error: "Failed to fetch file from Up2Tom", details: errorDetails },
                { status: response.status }
            );
        }

        // Retrieve the file as a blob/binary
        const fileBuffer = await response.arrayBuffer();

        // Set headers for file download
        const fileName = `${id}.csv`; // Adjust the file name as needed
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("Error downloading file:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    try {
        const contentType = await req.headers.get('content-type');
        // Parse the incoming form data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Prepare a new FormData instance for the Up2Tom API
        const up2TomFormData = new FormData();
        up2TomFormData.append('file', file);

        // Send the request to the Up2Tom API
        const up2TomResponse = await fetch(`https://api.up2tom.com/v3/batch/${id}`, {
            method: 'POST',
            headers: {
                Authorization: `Token ${process.env.TOM_API_KEY}`,
            },
            body: up2TomFormData, // Use the new FormData instance
        });

        if (!up2TomResponse.ok) {
            const errorDetails = await up2TomResponse.text();
            return NextResponse.json(
                { error: 'Failed to upload to Up2Tom', details: errorDetails },
                { status: up2TomResponse.status }
            );
        }

        const responseData = await up2TomResponse.json();
        return NextResponse.json({ message: 'File uploaded successfully', data: responseData });
    } catch (error) {
        console.error('Error handling file upload:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
