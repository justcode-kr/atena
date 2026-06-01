<script lang="ts">
	import type { MatchState, Side } from '$lib/scoring/types.js';

	type Props = {
		state: MatchState;
		onSettings: () => void;
		onNewGame: () => void;
	};

	let { state, onSettings, onNewGame }: Props = $props();

	const leftSide = $derived<Side>(state.courtSwapped ? 1 : 0);
	const rightSide = $derived<Side>(state.courtSwapped ? 0 : 1);

	const leftTeam = $derived(
		state.format.mode === 'doubles'
			? leftSide === 0
				? 'A팀'
				: 'B팀'
			: leftSide === 0
				? 'A'
				: 'B'
	);
	const rightTeam = $derived(
		state.format.mode === 'doubles'
			? rightSide === 0
				? 'A팀'
				: 'B팀'
			: rightSide === 0
				? 'A'
				: 'B'
	);

	const leftSets = $derived(state.score.sets[leftSide]);
	const rightSets = $derived(state.score.sets[rightSide]);
	const leftGames = $derived(state.score.games[leftSide]);
	const rightGames = $derived(state.score.games[rightSide]);
</script>

<div class="match-score-cluster">
	<div class="match-score-float" aria-label="세트 및 게임 스코어">
		<div class="msf-grid">
		<div class="msf-corner msf-cell">
			<button
				class="msf-settings-btn"
				type="button"
				aria-label="경기 설정"
				onclick={onSettings}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path
						d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
					/>
					<circle cx="12" cy="12" r="3" />
				</svg>
			</button>
		</div>
		<div
			class="msf-col-head msf-cell"
			class:msf-col-head--a={leftSide === 0}
			class:msf-col-head--b={leftSide === 1}
		>
			{leftTeam}
		</div>
		<div
			class="msf-col-head msf-cell"
			class:msf-col-head--a={rightSide === 0}
			class:msf-col-head--b={rightSide === 1}
		>
			{rightTeam}
		</div>

		<div class="msf-row-head msf-cell">S</div>
		<div class="msf-score msf-cell">{leftSets}</div>
		<div class="msf-score msf-cell">{rightSets}</div>

		<div class="msf-row-head msf-cell">G</div>
		<div class="msf-score msf-cell">{leftGames}</div>
		<div class="msf-score msf-cell">{rightGames}</div>
		</div>
	</div>

	<button class="new-game-btn" type="button" onclick={onNewGame}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<path d="M21 12a9 9 0 1 1-2.64-6.36" />
			<path d="M21 3v6h-6" />
		</svg>
		새 게임
	</button>
</div>
