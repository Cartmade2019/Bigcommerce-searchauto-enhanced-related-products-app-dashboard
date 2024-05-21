// // // @lib/dbs/mysql.ts
// // import { getRelatedProductCSVData } from '@lib/dbs/mysql';

// import axios from "axios";
// import { NextApiRequest, NextApiResponse } from "next";
// import * as XLSX from 'xlsx';

// // export default async function handler(req: NextApiRequest, res: NextApiResponse) {
// //     if (req.method === 'GET') {
// //         try {
// //             // Extract page and limit from query parameters, with defaults
// //             const sku = parseInt(req.query.sku as string) || 1;

// //             const csvData = await getRelatedProductCSVData(1);
// //             res.status(200).json(csvData);
// //         } catch (error) {
// //             res.status(500).json({ error: 'An error occurred while fetching categories.' });
// //         }
// //     } else {
// //         res.status(405).json({ error: 'Method not allowed.' });
// //     }
// // }


// // pages/api/script.js
// async function findVariantBySKU(skuToFind: string): Promise<any> {
//     try {
//         // URL of the Excel file
//         const url = 'https://cdn.shopify.com/s/files/1/0626/6067/3692/files/product_web_data_2023_bds_suspension_bros.xlsx';

//         // Fetch the Excel file
//         // const response = await axios.get(url, { responseType: 'arraybuffer' });
//         const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 }); // 5000ms = 5 seconds

//         // Convert the response to a buffer
//         const buffer = Buffer.from(response.data, 'binary');

//         // Read the Excel file
//         const workbook = XLSX.read(buffer, { type: 'buffer' });

//         // Assuming the variant data is in the first sheet and the SKU is in the "Variant SKU" column
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];

//         // Convert the worksheet to JSON
//         const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//         // Find the variant data by SKU
//         const skuToFind = 'BDS398H'; // Replace with the SKU you're looking for
//         const variant = jsonData.find(row => row[9] === skuToFind); // Adjusted to find by the 10th column

//         // Find the variant by its SKU
//         // const variant = jsonData.find((item: any) => item['Variant SKU'] === skuToFind);

//         if (!variant) {
//             return [];
//             throw new Error('Variant not found');
//         }
//         return variant;
//     } catch (error) {
//         console.error('Error reading Excel file:', error);
//         return [];
//         throw new Error('Internal Server Error');
//     }
// }


// async function readXlsxFile(url: string) {
//     const response = await fetch(url);
//     const arrayBuffer = await response.arrayBuffer();
//     const data = new Uint8Array(arrayBuffer);
//     const workbook = XLSX.read(data, { type: 'array' });
//     const sheetName = workbook.SheetNames[0]; // Assuming we're reading the first sheet
//     const sheet = workbook.Sheets[sheetName];
//     const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
//    // Find the row index for the given SKU
//    const headerRow:any = jsonData[0];
//    const skuIndex = headerRow.findIndex((header) => header === 'Variant SKU');
//    if (skuIndex === -1) {
//      throw new Error('Variant SKU column not found in the file.');
//    }
 
//    const skuData = jsonData.find((row) => row[skuIndex] === 'BDS398H');
 
//    if (skuData) {
//      // If SKU is found, return the row data
//      return skuData;
//    } else {
//      // If SKU is not found, return null or throw an error
//      return null;
//    }
//       return jsonData;
// }

// function appendDiv(sku: string, variant_data: any) {
//     console.log("tioppp", sku, variant_data);
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { sku } = req.query;
//     try {
//         // Validate the request if necessary
//         // Perform any necessary operations
//         // const variant = await findVariantBySKU('BDS398H');
//         const variant = 'uiooo';
//         // console.log(variant);
//         // Example usage
//         const url = 'https://cdn.shopify.com/s/files/1/0626/6067/3692/files/product_web_data_2023_bds_suspension_bros.xlsx';
//         readXlsxFile(url).then(data => {
//             // Return the script
//             res.setHeader('Content-Type', 'application/javascript');
//             res.setHeader('Cache-Control', 'public, max-age=86400');
//             // (${appendDiv.toString()})('${sku}', ${JSON.stringify(variant)});
//             res.end(`
//         (${appendDiv.toString()})('${sku}', ${JSON.stringify(data)});
//       `);
//         }).catch(error => {
//             console.error('Failed to read XLSX file:', error);
//         });


//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sku } = req.query;

  // Validate the sku query parameter
  if (!sku || typeof sku !== 'string') {
    res.status(400).json({ error: 'Invalid SKU parameter' });
    return;
  }

  // Set the content type to JavaScript
  res.setHeader('Content-Type', 'application/javascript');

  // Return a script that logs the SKU to the console
  res.send(`
    console.log('SKU: ${sku}');
  `);
}
