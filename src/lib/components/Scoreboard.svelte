<script lang="ts">
	import MatchScoreFloat from '$lib/components/MatchScoreFloat.svelte';
	import { getMatchActions } from '$lib/match-context.js';
	import ServeBall from '$lib/components/ServeBall.svelte';
	import { formatGamePoint } from '$lib/scoring/game-points.js';
	import type { MatchState, Side } from '$lib/scoring/types.js';

	type Props = {
		state: MatchState;
		gameEndWinner: Side | null;
		showCourtChange: boolean;
		onSettings: () => void;
		onNewGame: () => void;
	};

	let { state, gameEndWinner, showCourtChange, onSettings, onNewGame }: Props = $props();
	const { increment, undo } = getMatchActions();

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

	const leftPoint = $derived(formatGamePoint(state.score.points, leftSide));
	const rightPoint = $derived(formatGamePoint(state.score.points, rightSide));
	const leftLong = $derived(leftPoint.length > 2);
	const rightLong = $derived(rightPoint.length > 2);
	const disabled = $derived(state.matchWinner !== null);
	const isDeuce = $derived(state.score.points.phase === 'deuce');
	const showGameEnd = $derived(gameEndWinner !== null);
	const showWinLeft = $derived(showGameEnd && gameEndWinner === leftSide);
	const showWinRight = $derived(showGameEnd && gameEndWinner === rightSide);
	const leftIsServer = $derived(state.server === leftSide);
	const rightIsServer = $derived(state.server === rightSide);

	function tapSide(side: Side) {
		if (disabled) return;
		increment(side);
	}

	function stopTap(e: MouseEvent) {
		e.stopPropagation();
	}
</script>

<section class="scoreboard" aria-label="현재 게임 스코어">
	<MatchScoreFloat {state} {onSettings} {onNewGame} />

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="score-side"
		class:score-side--a={leftSide === 0}
		class:score-side--b={leftSide === 1}
		role="button"
		tabindex={disabled ? -1 : 0}
		aria-disabled={disabled}
		aria-label="{leftTeam}{leftIsServer ? ', 서브' : ''} 점수 올리기"
		onclick={() => tapSide(leftSide)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				tapSide(leftSide);
			}
		}}
	>
		<div class="score-content">
			<span class="panel-team">{leftTeam}</span>
			<div class="score-stack">
				{#if leftIsServer}
					<div class="serve-slot" aria-hidden="true">🎾</div>
				{/if}
				<div class="point-slot">
					<span class="point-display" class:point-display--text={leftLong}>{leftPoint}</span>
				</div>
				{#if !showGameEnd && !showCourtChange}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="panel-controls" onclick={stopTap}>
						<button
							class="ctrl-btn ctrl-btn--minus"
							type="button"
							{disabled}
							aria-label="{leftTeam} 점수 되돌리기"
							onclick={() => undo(leftSide)}
						>−</button>
						<button
							class="ctrl-btn ctrl-btn--plus"
							type="button"
							{disabled}
							aria-label="{leftTeam} 점수 올리기"
							onclick={() => increment(leftSide)}
						>+</button>
					</div>
				{/if}
				<div class="win-slot">
					<span class="win-indicator" class:win-indicator--visible={showWinLeft}>WIN!</span>
				</div>
			</div>
		</div>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="score-side"
		class:score-side--a={rightSide === 0}
		class:score-side--b={rightSide === 1}
		role="button"
		tabindex={disabled ? -1 : 0}
		aria-disabled={disabled}
		aria-label="{rightTeam}{rightIsServer ? ', 서브' : ''} 점수 올리기"
		onclick={() => tapSide(rightSide)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				tapSide(rightSide);
			}
		}}
	>
		<div class="score-content">
			<span class="panel-team">{rightTeam}</span>
			<div class="score-stack">
				{#if rightIsServer}
					<div class="serve-slot" aria-hidden="true">🎾</div>
				{/if}
				<div class="point-slot">
					<span class="point-display" class:point-display--text={rightLong}>{rightPoint}</span>
				</div>
				{#if !showGameEnd && !showCourtChange}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="panel-controls" onclick={stopTap}>
						<button
							class="ctrl-btn ctrl-btn--minus"
							type="button"
							{disabled}
							aria-label="{rightTeam} 점수 되돌리기"
							onclick={() => undo(rightSide)}
						>−</button>
						<button
							class="ctrl-btn ctrl-btn--plus"
							type="button"
							{disabled}
							aria-label="{rightTeam} 점수 올리기"
							onclick={() => increment(rightSide)}
						>+</button>
					</div>
				{/if}
				<div class="win-slot">
					<span class="win-indicator" class:win-indicator--visible={showWinRight}>WIN!</span>
				</div>
			</div>
		</div>
	</div>

	{#if showGameEnd}
		<div class="deuce-badge" aria-live="polite">GAME</div>
	{:else if showCourtChange}
		<div class="deuce-badge court-change-badge" aria-live="polite">코트체인지</div>
	{:else if isDeuce}
		<div class="deuce-badge" aria-live="polite">DEUCE</div>
	{/if}
</section>
