import PDFDocument from "pdfkit";
import fetch from "node-fetch";

export const generatePDFCloudinary = async (imageArray, type) => {
  
  const doc = new PDFDocument({ margin: 20, size: "A4" });

  try {
    // Concurrently fetch all images
    const responses = await Promise.all(imageArray.map(url => fetch(url)));

    // Iterate through each response
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];

      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${imageArray[i]}`);
      }

      const imageBuffer = await response.arrayBuffer();

       const pageWidth = doc.page.width;
       const pageHeight = doc.page.height;

       const imageWidth =
         type === "prescriptionOnly"
           ? pageWidth - 20
           : type === "cardOnly"
           ? 550
           : type === "referralOnly"
           ? pageWidth - 20
           : 200; // Adjust as needed
       const imageHeight =
         type === "prescriptionOnly"
           ? pageHeight - 20
           : type === "cardOnly"
           ? 300
           : type === "referralOnly"
           ? pageHeight - 20
           : 200; // Adjust as needed

       const xPosition = (doc.page.width - imageWidth) / 2;
       const yPosition = (doc.page.height - imageHeight) / 2;

       doc.image(imageBuffer, xPosition, yPosition, {
         width: imageWidth,
         height: imageHeight,
       });
      if (i !== responses.length - 1) {
        doc.addPage();
      }
    }

    // Convert the PDF document to a base64 string
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
    
    const base64PDF = pdfBuffer.toString("base64");
    return base64PDF;

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
