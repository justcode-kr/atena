import { addGamePoint, emptyGamePoints, getGameWinDisplayPoints } from './game-points.js';
import { CLUB_FORMAT, INTERNATIONAL_FORMAT } from './presets.js';
import type { MatchFormat, MatchState, Side } from './types.js';

export { CLUB_FORMAT, INTERNATIONAL_FORMAT };

export function setsNeededToWin(setsInMatch: 1 | 3 | 5): number {
	return Math.ceil(setsInMatch / 2);
}

function switchServer(state: MatchState): MatchState {
	return { ...state, server: (1 - state.server) as Side };
}

export { switchServer };

export function createMatchState(
	format: MatchFormat,
	noAd = false,
	courtChange = false,
	server: Side = 0
): MatchState {
	return {
		format,
		noAd,
		courtChange,
		courtSwapped: false,
		server,
		score: {
			sets: [0, 0],
			games: [0, 0],
			points: emptyGamePoints()
		},
		matchWinner: null
	};
}

function isSetWon(games: [number, number], format: MatchFormat, side: Side): boolean {
	const [left, right] = games;
	const target = format.gamesToWinSet;
	const scorer = side === 0 ? left : right;
	const opponent = side === 0 ? right : left;

	if (scorer < target) return false;
	if (!format.winByTwo) return scorer >= target;
	return scorer >= target && scorer - opponent >= 2;
}

function applySetWin(state: MatchState, side: Side): MatchState {
	const sets: [number, number] = [...state.score.sets] as [number, number];
	sets[side] += 1;

	const needed = setsNeededToWin(state.format.setsInMatch);
	const { points } = state.score;

	if (sets[side] >= needed) {
		return {
			...state,
			score: {
				sets,
				games: [0, 0],
				points
			},
			matchWinner: side
		};
	}

	return {
		...state,
		score: {
			sets,
			games: [0, 0],
			points
		},
		matchWinner: null
	};
}

function applyGameWin(state: MatchState, side: Side): MatchState {
	const games: [number, number] = [...state.score.games] as [number, number];
	games[side] += 1;
	const { points } = state.score;

	if (isSetWon(games, state.format, side)) {
		return applySetWin(
			{
				...state,
				score: { ...state.score, games, points }
			},
			side
		);
	}

	return {
		...state,
		score: { ...state.score, games, points }
	};
}

export function scorePoint(state: MatchState, side: Side): MatchState {
	if (state.matchWinner !== null) return state;

	const { points, gameWinner } = addGamePoint(state.score.points, side, state.noAd);
	if (gameWinner === null) {
		return {
			...state,
			score: { ...state.score, points }
		};
	}

	const displayPoints = getGameWinDisplayPoints(state.score.points, side, state.noAd);

	return applyGameWin(
		{
			...state,
			score: { ...state.score, points: displayPoints }
		},
		gameWinner
	);
}

export function updateFormat(state: MatchState, format: MatchFormat): MatchState {
	return { ...state, format };
}

export function updateNoAd(state: MatchState, noAd: boolean): MatchState {
	let points = state.score.points;
	if (
		noAd &&
		(points.phase === 'advantage-left' || points.phase === 'advantage-right')
	) {
		points = { left: 3, right: 3, phase: 'deuce' };
	}
	return {
		...state,
		noAd,
		score: { ...state.score, points }
	};
}

export function updateCourtChange(state: MatchState, courtChange: boolean): MatchState {
	return { ...state, courtChange };
}

export function resetMatch(
	format: MatchFormat,
	noAd: boolean,
	courtChange = false,
	server: Side = 0
): MatchState {
	return createMatchState(format, noAd, courtChange, server);
}
