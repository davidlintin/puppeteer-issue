import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request) {
  try {
    const filename = "example.pdf";
    const pdfBuffer = await generatePDF();
    return downloadPDF(filename, pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function generatePDF() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const PREVIEW_URL = process.env.PREVIEW_URL || "http://localhost:3000/preview";
    await page.goto(PREVIEW_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      // format: "A4",
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    return pdfBuffer;
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

function downloadPDF(filename, data) {
  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": Buffer.byteLength(data).toString(),
      "Content-Type": "application/pdf",
    },
  });
}
