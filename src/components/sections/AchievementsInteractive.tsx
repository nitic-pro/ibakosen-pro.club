import { useEffect, useState } from 'react';
import {
	type AchievementData,
	type AchievementYearGroup,
	formatAchievementDate,
	parseMarkdownLink,
} from '../../lib/achievements';

interface Props {
	achievementsByYear: AchievementYearGroup[];
}

const linkClass =
	'inline-flex items-center gap-1.5 font-mono text-[0.85rem] text-neon-cyan no-underline hover:underline';

export default function AchievementsInteractive({ achievementsByYear }: Props) {
	const [activeAchievement, setActiveAchievement] = useState<AchievementData | null>(null);
	const extraLink = activeAchievement ? parseMarkdownLink(activeAchievement.link) : null;

	useEffect(() => {
		if (!activeAchievement) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setActiveAchievement(null);
		};
		document.addEventListener('keydown', onKeyDown);
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = '';
		};
	}, [activeAchievement]);

	return (
		<>
			<div className="mx-auto flex max-w-[640px] flex-col gap-8">
				{achievementsByYear.map((group) => (
					<div className="flex gap-3 sm:gap-5" key={group.year}>
						<span className="h-fit flex-shrink-0 rounded border border-neon-cyan/40 bg-bg-card px-3 py-1.5 font-display text-[0.95rem] font-bold text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.25)]">
							{group.year}
						</span>
						<ul className="flex flex-1 flex-col gap-1 border-l border-neon-cyan/15 py-1 pl-3 font-mono text-[0.9rem] sm:pl-5">
							{group.items.map((item) => (
								<li key={item.title}>
									<button
										className="group flex w-full flex-col gap-0.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-neon-cyan/5"
										onClick={() => setActiveAchievement(item)}
										type="button"
									>
										<span className="flex flex-wrap items-baseline gap-x-2">
											<span className="text-ink group-hover:text-neon-cyan">{item.title}</span>
											<span className="font-bold text-neon-magenta">{item.result}</span>
											<span className="ml-auto font-mono text-[0.75rem] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
												詳細 →
											</span>
										</span>
										{formatAchievementDate(item) && (
											<span className="font-mono text-[0.75rem] text-ink-muted">{formatAchievementDate(item)}</span>
										)}
									</button>
								</li>
							))}
						</ul>
					</div>
				))}

				<div className="flex items-center gap-3 sm:gap-5">
					<span className="h-fit flex-shrink-0 rounded border border-neon-green/40 bg-bg-card px-3 py-1.5 font-display text-[0.95rem] font-bold text-neon-green shadow-[0_0_10px_rgba(57,255,136,0.25)]">
						????
					</span>
					<p className="flex-1 border-l border-neon-cyan/15 py-1 pl-3 font-mono text-[0.9rem] text-neon-green sm:pl-5">
						<span className="text-ink-muted">&gt;</span> what's next...?
						<span className="ml-1 inline-block h-[1em] w-2 animate-blink bg-neon-green align-text-bottom" />
					</p>
				</div>
			</div>

			{activeAchievement && (
				<div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
					<button
						aria-label="モーダルを閉じる"
						className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
						onClick={() => setActiveAchievement(null)}
						type="button"
					/>
					<div className="card-corners relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded border border-neon-cyan/30 bg-bg-card p-5 shadow-[0_0_40px_rgba(0,240,255,0.18)] sm:p-7">
						<button
							aria-label="モーダルを閉じる"
							className="absolute top-4 right-4 font-mono text-ink-muted transition-colors hover:text-neon-cyan"
							onClick={() => setActiveAchievement(null)}
							type="button"
						>
							[x]
						</button>
						<div className="flex flex-wrap items-center gap-2">
							<span className="inline-block rounded border border-neon-cyan/40 bg-bg px-2.5 py-1 font-display text-[0.8rem] font-bold text-neon-cyan">
								{activeAchievement.year}
							</span>
							{formatAchievementDate(activeAchievement) && (
								<span className="font-mono text-[0.8rem] text-ink-muted">{formatAchievementDate(activeAchievement)}</span>
							)}
						</div>
						<h3 className="mt-4 font-display text-[1.25rem] font-bold text-ink">{activeAchievement.title}</h3>
						<p className="mt-1 font-mono text-[0.95rem] font-bold text-neon-magenta">{activeAchievement.result}</p>
						<p className="mt-4 text-[0.92rem] leading-relaxed text-ink-muted">{activeAchievement.description}</p>
						{(activeAchievement.event_website || extraLink) && (
							<div className="mt-5 flex flex-col items-start gap-2">
								{activeAchievement.event_website && (
									<a
										className={linkClass}
										href={activeAchievement.event_website}
										rel="noreferrer"
										target="_blank"
									>
										公式サイトを見る →
									</a>
								)}
								{extraLink && (
									<a className={linkClass} href={extraLink.url} rel="noreferrer" target="_blank">
										{extraLink.label} →
									</a>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
