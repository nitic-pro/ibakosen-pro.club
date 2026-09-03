#!/usr/bin/env node
// Pre-build step: for every PDF referenced in src/content/materials/*.mdx,
// render each page to a JPEG under public/materials/.generated/<pdf-basename>/.
// src/pages/materials/[id].astro serves these pre-rendered images instead of
// doing PDF rendering in the visitor's browser (which was flaky). PDFs whose
// output is already up to date (JPEGs newer than the source PDF) are skipped.
//
// Run automatically via the "prebuild" npm/bun script hook (see package.json).

import { createCanvas } from '@napi-rs/canvas';
import matter from 'gray-matter';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MATERIALS_CONTENT_DIR = join(ROOT, 'src/content/materials');
const PUBLIC_DIR = join(ROOT, 'public');
const GENERATED_ROOT = join(PUBLIC_DIR, 'materials/.generated');
const TARGET_WIDTH = 1600;
const JPEG_QUALITY = 82;

function findPdfUrls() {
	if (!existsSync(MATERIALS_CONTENT_DIR)) return [];
	const urls = new Set();
	for (const file of readdirSync(MATERIALS_CONTENT_DIR)) {
		if (extname(file) !== '.mdx') continue;
		const raw = readFileSync(join(MATERIALS_CONTENT_DIR, file), 'utf8');
		const { data } = matter(raw);
		for (const item of data.files ?? []) {
			if (typeof item?.url === 'string' && item.url.toLowerCase().endsWith('.pdf')) {
				urls.add(item.url);
			}
		}
	}
	return [...urls];
}

async function convertPdf(url) {
	const pdfPath = join(PUBLIC_DIR, url.replace(/^\//, ''));
	if (!existsSync(pdfPath)) {
		console.warn(`[convert-pdfs] skip (file not found): ${url}`);
		return;
	}

	const outDir = join(GENERATED_ROOT, basename(pdfPath, '.pdf'));
	const firstPageOut = join(outDir, 'page-1.jpg');
	if (existsSync(firstPageOut) && statSync(firstPageOut).mtimeMs > statSync(pdfPath).mtimeMs) {
		console.log(`[convert-pdfs] up to date, skipping: ${url}`);
		return;
	}

	mkdirSync(outDir, { recursive: true });
	const data = new Uint8Array(readFileSync(pdfPath));
	const doc = await getDocument({ data, disableFontFace: true }).promise;

	for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
		const page = await doc.getPage(pageNumber);
		const unscaledViewport = page.getViewport({ scale: 1 });
		const viewport = page.getViewport({ scale: TARGET_WIDTH / unscaledViewport.width });

		const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
		const context = canvas.getContext('2d');
		await page.render({ canvasContext: context, canvas, viewport }).promise;

		const jpeg = canvas.toBuffer('image/jpeg', JPEG_QUALITY);
		writeFileSync(join(outDir, `page-${pageNumber}.jpg`), jpeg);
	}

	console.log(`[convert-pdfs] rendered ${doc.numPages} page(s): ${url}`);
}

const pdfUrls = findPdfUrls();
if (pdfUrls.length === 0) {
	console.log('[convert-pdfs] no PDFs referenced in src/content/materials, nothing to do.');
} else {
	for (const url of pdfUrls) {
		await convertPdf(url);
	}
}
