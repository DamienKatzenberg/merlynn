### **README for UP2TOM Application**

---

## **Overview**

This is a web application built using **Next.js** that allows users to prompt the Up2Tom API. Users are able to prompt the AI directly from the app or they can choose to upload a csv file containing multiple prompts. The app contains the following features:

- Model selection
- Query the model with dynamic input forms based on predefined model configurations.
- File upload with validation.
- Batch job tracking.
- File download functionality.
- Dark theme UI for better user experience.

---

## **Features**

### **1. Model Selection**
Users can pick which model they would like to prompt.

### **2. Querying**
Once a user has selected their model a dynamic form will appear which allows them to fill in all required input fields for the model. The form has input validation and supports the exclusion rules outlined in the Up2Tom API documentation

### **3. File Upload**
Users can upload batch files in `.csv` format to be processed by specific models. The system validates the uploaded file and sends it to the Up2Tom API for processing.

### **4. Job Tracking**
The application lists completed jobs with details like:
- **Job ID**
- **File Name**
- **Timestamp**

### **5. File Download**
Users can download processed files through the application. The download functionality fetches the file from the server API.

### **6. Dark Mode**
The UI leverages ShadCN components for a modern and accessible dark theme.

---

## **Technologies Used**

- **Frontend:**
  - Next.js
  - React.js
  - ShadCN UI components
  - Tailwind CSS for styling

- **Backend:**
  - Next.js API routes for handling file uploads and API interactions.
  - Integration with Up2Tom API for batch processing.

---

## **Setup and Installation**

### **Prerequisites**
1. Node.js installed on your machine.
2. Up2Tom API key.
3. MongoDb URI 

### **Steps**
1. Clone the repository:
   ```bash
   git clone https://github.com/DamienKatzenberg/merlynn
   ```
2. Navigate to the project directory:
   ```bash
   cd batch-processing-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file in the root directory and configure the following variables:
   ```env
   MONGODB_URI="mongodb_uri"
   MONGODB_DB="merlynn"
   TOM_API_KEY=your_up2tom_api_key
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open the application in your browser:
   ```bash
   http://localhost:3000
   ```

---

## **How to Use**

### **1. Query a model**
1. Navigate to the "New prompt" page.
2. Select a model from the dropdown.
3. Fill in the fields and hit submit.
4. View the decision on the "Decisions" page

### **2. Upload a File**
1. Navigate to the "Batch" page.
2. Select a model from the dropdown.
3. Use the file upload button to upload your `.csv` file.

### **3. View Jobs**
- Completed jobs will be listed on the "Batch" page below the upload file.

### **4. Download Processed Files**
- Click the **Download** button next to a completed job to download the processed file.


