export interface AchievementData {
	year: number;
	title: string;
	result: string;
	description: string;
	event_website?: string;
	link?: string;
	startDate?: string;
	endDate?: string;
}

export interface AchievementYearGroup {
	year: number;
	items: AchievementData[];
}

// "YYYY-MM" (month precision) has no day, so pad it to the 1st for a comparable "YYYY-MM-DD" string.
const toSortableDate = (date?: string) => (date && date.length === 7 ? `${date}-01` : (date ?? ''));

export function groupAchievementsByYear(entries: AchievementData[]): AchievementYearGroup[] {
	return Object.values(Object.groupBy(entries, (item) => item.year))
		.filter((items) => items !== undefined)
		.map((items) => ({
			year: items[0].year,
			items: items.toSorted((a, b) => toSortableDate(b.startDate).localeCompare(toSortableDate(a.startDate))),
		}))
		.sort((a, b) => b.year - a.year);
}

// Formats a "YYYY-MM-DD" (day precision) or "YYYY-MM" (month precision) string.
export function formatJaDate(isoDate: string): string {
	const [year, month, day] = isoDate.split('-');
	return day ? `${year}年${Number(month)}月${Number(day)}日` : `${year}年${Number(month)}月`;
}

// Renders a single date, or a "start 〜 end" range when the achievement spans multiple days/months.
export function formatAchievementDate({ startDate, endDate }: Pick<AchievementData, 'startDate' | 'endDate'>) {
	if (!startDate) return null;
	if (!endDate || endDate === startDate) return formatJaDate(startDate);
	return `${formatJaDate(startDate)} 〜 ${formatJaDate(endDate)}`;
}

// Parses a "[表示テキスト](https://example.com)" markdown link into its label and url.
export function parseMarkdownLink(value?: string): { label: string; url: string } | null {
	if (!value) return null;
	const match = value.match(/^\[(.+)\]\((\S+)\)$/);
	if (!match) return null;
	const [, label, url] = match;
	return { label, url };
}
