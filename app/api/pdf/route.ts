import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { html } = await req.json();
    
    // Captura o host para resolver caminhos de imagem (ex: localhost:3000)
    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let browser;

    if (process.env.NODE_ENV === 'development') {
      // Caminhos comuns de navegadores no Windows (incluindo o Brave)
      const paths = [
        "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
      ];

      const executablePath = paths.find(path => fs.existsSync(path));

      if (!executablePath) {
        throw new Error("Nenhum navegador compatível encontrado para gerar o PDF localmente.");
      }

      browser = await puppeteer.launch({
        executablePath,
        headless: true,
      });
    } else {
      // Configuração para Produção (Vercel)
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();
    
    // A tag <base> faz com que imagens como "/fundo_timbrado.jpg" 
    // funcionem apontando para o seu servidor local ou produção.
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <base href="${baseUrl}/">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          <div style="width: 210mm;">${html}</div>
        </body>
      </html>
    `, { waitUntil: 'networkidle0' }); // Espera todas as imagens carregarem

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="proposta.pdf"',
      },
    });
  } catch (error: any) {
    console.error('ERRO NO SERVIDOR PDF:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}