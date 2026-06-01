<script lang="ts">
	import GameEndOverlay from '$lib/components/GameEndOverlay.svelte';
	import Header from '$lib/components/Header.svelte';
	import Scoreboard from '$lib/components/Scoreboard.svelte';
	import ServeSelectModal from '$lib/components/ServeSelectModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import { setMatchActions } from '$lib/match-context.js';
	import { announceGame, announcePoints, stopScoreVoice } from '$lib/score-voice.js';
	import { isCourtChangeGame } from '$lib/scoring/court-change.js';
	import { emptyGamePoints } from '$lib/scoring/game-points.js';
	import {
		createMatchState,
		resetMatch,
		scorePoint,
		switchServer,
		updateCourtChange,
		updateFormat,
		updateNoAd
	} from '$lib/scoring/match.js';
	import { INTERNATIONAL_FORMAT } from '$lib/scoring/presets.js';
	import type { MatchFormat, MatchState, Side } from '$lib/scoring/types.js';

	const STORAGE_KEY = 'tw-match-config';

	type SavedConfig = {
		format?: MatchFormat;
		noAd?: boolean;
		courtChange?: boolean;
	};

	type MatchOverlayState = {
		winner: Side;
	};

	function loadConfig(): { format: MatchFormat; noAd: boolean; courtChange: boolean } {
		if (typeof localStorage === 'undefined') {
			return { format: INTERNATIONAL_FORMAT, noAd: false, courtChange: false };
		}
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const saved = JSON.parse(raw) as SavedConfig & MatchFormat;
				if (saved.format) {
					return {
						format: { ...INTERNATIONAL_FORMAT, ...saved.format },
						noAd: saved.noAd ?? false,
						courtChange: saved.courtChange ?? false
					};
				}
				if (saved.mode !== undefined) {
					return {
						format: { ...INTERNATIONAL_FORMAT, ...saved },
						noAd: false,
						courtChange: false
					};
				}
			}
		} catch {
			/* ignore */
		}
		return { format: INTERNATIONAL_FORMAT, noAd: false, courtChange: false };
	}

	function saveConfig(nextFormat: MatchFormat, noAd: boolean, courtChange: boolean) {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ format: nextFormat, noAd, courtChange })
		);
	}

	const initialConfig = loadConfig();
	let format = $state<MatchFormat>(initialConfig.format);
	let match = $state<MatchState>(
		createMatchState(initialConfig.format, initialConfig.noAd, initialConfig.courtChange)
	);
	let history = $state<MatchState[]>([]);
	let settingsOpen = $state(false);
	let matchOverlay = $state<MatchOverlayState | null>(null);
	let gameEnd = $state<{ winner: Side; endedGames: [number, number] } | null>(null);
	let courtChangeActive = $state(false);
	let serveSelectOpen = $state(false);

	function gamesAfterWin(games: [number, number], winner: Side): [number, number] {
		const next = [...games] as [number, number];
		next[winner] += 1;
		return next;
	}

	function cloneMatch(state: MatchState): MatchState {
		return {
			...state,
			format: { ...state.format },
			score: {
				sets: [...state.score.sets] as [number, number],
				games: [...state.score.games] as [number, number],
				points: { ...state.score.points }
			}
		};
	}

	function pushHistory() {
		history = [...history, cloneMatch(match)];
		if (history.length > 50) history = history.slice(-50);
	}

	function winnerDisplayName(side: Side): string {
		const team = side === 0 ? 'A' : 'B';
		if (match.format.mode === 'doubles') return `${team}팀 WIN`;
		return `${team} WIN`;
	}

	function startCourtChange() {
		courtChangeActive = true;
		match = { ...match, courtSwapped: !match.courtSwapped };
	}

	function dismissCourtChange() {
		courtChangeActive = false;
	}

	function maybeStartCourtChange(games: [number, number]) {
		if (match.courtChange && isCourtChangeGame(games)) {
			startCourtChange();
		}
	}

	function handleScore(side: Side) {
		if (matchOverlay !== null) return;

		if (courtChangeActive) {
			dismissCourtChange();
			return;
		}

		if (gameEnd !== null) {
			const { endedGames } = gameEnd;
			gameEnd = null;
			match = switchServer({
				...match,
				score: { ...match.score, points: emptyGamePoints() }
			});
			maybeStartCourtChange(endedGames);
			return;
		}

		if (match.matchWinner !== null) return;

		const prev = match;
		const prevGames = prev.score.games;
		pushHistory();
		match = scorePoint(match, side);

		const gamesChanged =
			match.score.games[0] !== prevGames[0] || match.score.games[1] !== prevGames[1];

		if (match.matchWinner !== null && prev.matchWinner === null) {
			announceGame();
			matchOverlay = { winner: match.matchWinner };
		} else if (gamesChanged) {
			announceGame();
			gameEnd = { winner: side, endedGames: gamesAfterWin(prevGames, side) };
		} else {
			announcePoints(match.score.points, match.server);
		}
	}

	function handleUndo(_side: Side) {
		if (matchOverlay !== null) return;

		stopScoreVoice();

		if (courtChangeActive) {
			dismissCourtChange();
			match = { ...match, courtSwapped: !match.courtSwapped };
			return;
		}

		if (gameEnd !== null) {
			gameEnd = null;
			match = {
				...match,
				score: { ...match.score, points: emptyGamePoints() }
			};
			return;
		}

		if (history.length === 0) return;
		match = history[history.length - 1];
		history = history.slice(0, -1);
		courtChangeActive = false;
	}

	function finishMatchOverlay() {
		matchOverlay = null;
		history = [];
		match = resetMatch(format, match.noAd, match.courtChange, 0);
		courtChangeActive = false;
	}

	setMatchActions({
		increment: handleScore,
		undo: handleUndo
	});

	function handleApplySettings(next: MatchFormat, noAd: boolean, courtChange: boolean) {
		format = next;
		saveConfig(next, noAd, courtChange);
		match = updateCourtChange(updateNoAd(updateFormat(match, next), noAd), courtChange);
	}

	function handleNewGame() {
		if (matchOverlay !== null || gameEnd !== null || courtChangeActive) return;
		if (!confirm('새 게임을 시작할까요?')) return;
		serveSelectOpen = true;
	}

	function startNewMatch(server: Side) {
		history = [];
		match = resetMatch(format, match.noAd, match.courtChange, server);
		courtChangeActive = false;
	}

	const matchOverlayWinnerLabel = $derived(
		matchOverlay ? winnerDisplayName(matchOverlay.winner) : ''
	);

	const gameEndWinner = $derived(gameEnd?.winner ?? null);
</script>

<div class="app">
	<Header />

	<Scoreboard
		state={match}
		{gameEndWinner}
		showCourtChange={courtChangeActive}
		onSettings={() => (settingsOpen = true)}
		onNewGame={handleNewGame}
	/>
</div>

{#if matchOverlay}
	<GameEndOverlay
		variant="match"
		winnerLabel={matchOverlayWinnerLabel}
		onComplete={finishMatchOverlay}
	/>
{/if}

<SettingsModal
	open={settingsOpen}
	{format}
	noAd={match.noAd}
	courtChange={match.courtChange}
	onClose={() => (settingsOpen = false)}
	onApply={handleApplySettings}
/>

<ServeSelectModal
	open={serveSelectOpen}
	{format}
	onClose={() => (serveSelectOpen = false)}
	onConfirm={startNewMatch}
/>
