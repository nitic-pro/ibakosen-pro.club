import { marked } from 'marked';

// Renders a Markdown string field (e.g. a materials `description`) to HTML.
// Safe to use with set:html on a page body -- not safe for values that could
// contain untrusted user input, since marked does not sanitize output.
export function renderMarkdown(text: string): string {
	return marked.parse(text, { async: false });
}

// Strips Markdown syntax down to plain text, for places that need a single
// line of text (e.g. a <meta name="description"> tag or a card excerpt)
// rather than rendered HTML.
export function stripMarkdown(text: string): string {
	return text
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`#>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}
