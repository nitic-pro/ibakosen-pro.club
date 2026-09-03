// Full official name, used in <title> tags so search results/browser tabs are unambiguous
// about which school's club this is (the "NITIC-PRO" brand mark alone doesn't convey that).
export const siteName = '茨城高専 プログラミング同好会';

export const sectionClass = 'border-t border-neon-cyan/10 py-16';

const navLinkBaseClass =
	'relative font-mono text-[0.85rem] tracking-wide no-underline transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-neon-cyan after:shadow-[0_0_6px_var(--color-neon-cyan)] after:transition-all after:duration-300';

export const navLinkClass = `${navLinkBaseClass} text-ink-muted hover:text-neon-cyan after:w-0 hover:after:w-full`;

export const navLinkActiveClass = `${navLinkBaseClass} text-neon-cyan after:w-full`;

export const btnBaseClass =
	'clip-cyber inline-flex items-center gap-2 rounded px-6 py-3 font-mono text-[0.88rem] font-bold tracking-wide no-underline transition-all hover:-translate-y-0.5';

export const cardClass =
	'card-corners relative rounded border border-neon-cyan/20 bg-gradient-to-br from-bg-card to-bg-card/40 p-6 transition-all hover:-translate-y-1 hover:border-neon-cyan/40 hover:shadow-[0_8px_28px_rgba(0,240,255,0.12)]';

export const navLinks = [
	{ href: '/about', label: '同好会について' },
	{ href: '/achievements', label: 'イベント・実績' },
	{ href: '/materials', label: '資料' },
	{ href: '/blog', label: 'ブログ' },
	{ href: '/join', label: '入部案内' },
];
