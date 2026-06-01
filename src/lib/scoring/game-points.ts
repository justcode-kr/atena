import type { GamePoints, Side } from './types.js';

const LABELS = ['0', '15', '30', '40'] as const;

export function emptyGamePoints(): GamePoints {
	return { left: 0, right: 0, phase: 'normal' };
}

export function formatGamePoint(points: GamePoints, side: Side): string {
	if (points.phase === 'deuce') return '40';
	if (points.phase === 'advantage-left') return side === 0 ? 'Ad' : '40';
	if (points.phase === 'advantage-right') return side === 1 ? 'Ad' : '40';
	return LABELS[side === 0 ? points.left : points.right] ?? '0';
}

export function addGamePoint(
	points: GamePoints,
	side: Side,
	noAd: boolean
): { points: GamePoints; gameWinner: Side | null } {
	if (points.phase === 'deuce') {
		if (noAd) return { points: emptyGamePoints(), gameWinner: side };
		return {
			points: {
				...points,
				phase: side === 0 ? 'advantage-left' : 'advantage-right'
			},
			gameWinner: null
		};
	}

	if (points.phase === 'advantage-left') {
		if (noAd) {
			if (side === 0) return { points: emptyGamePoints(), gameWinner: 0 };
			return { points: { left: 3, right: 3, phase: 'deuce' }, gameWinner: null };
		}
		if (side === 0) return { points: emptyGamePoints(), gameWinner: 0 };
		return { points: { ...points, phase: 'deuce' }, gameWinner: null };
	}

	if (points.phase === 'advantage-right') {
		if (noAd) {
			if (side === 1) return { points: emptyGamePoints(), gameWinner: 1 };
			return { points: { left: 3, right: 3, phase: 'deuce' }, gameWinner: null };
		}
		if (side === 1) return { points: emptyGamePoints(), gameWinner: 1 };
		return { points: { ...points, phase: 'deuce' }, gameWinner: null };
	}

	const prevLeft = points.left;
	const prevRight = points.right;
	const prevScorer = side === 0 ? prevLeft : prevRight;
	const prevOpponent = side === 0 ? prevRight : prevLeft;

	// 이미 40점인 상태에서 득점 → 게임 종료 (40-30, 40-15, 40-0)
	if (prevScorer === 3 && prevOpponent < 3) {
		return { points: emptyGamePoints(), gameWinner: side };
	}

	const scores: [number, number] = [prevLeft, prevRight];
	scores[side] += 1;
	const opponent = scores[1 - side];
	const scorer = scores[side];

	// 30-30 등에서 40 도달 (게임은 아직 계속)
	if (scorer === 3 && opponent < 3) {
		return {
			points: { left: scores[0], right: scores[1], phase: 'normal' },
			gameWinner: null
		};
	}

	// 40-40 → 듀스 (노애드는 다음 포인트에서 승부)
	if (scorer === 3 && opponent === 3) {
		return {
			points: { left: 3, right: 3, phase: 'deuce' },
			gameWinner: null
		};
	}

	return {
		points: { left: scores[0], right: scores[1], phase: 'normal' },
		gameWinner: null
	};
}

/** 게임 종료 직후 스코어보드에 보여줄 포인트 상태 (0-0 리셋 전 화면) */
export function getGameWinDisplayPoints(
	prev: GamePoints,
	winner: Side,
	noAd: boolean
): GamePoints {
	const { gameWinner } = addGamePoint(prev, winner, noAd);
	if (gameWinner === null) return prev;

	if (prev.phase === 'deuce') {
		return { left: 3, right: 3, phase: 'deuce' };
	}

	if (prev.phase === 'advantage-left' || prev.phase === 'advantage-right') {
		return { ...prev };
	}

	const prevScorer = winner === 0 ? prev.left : prev.right;
	const prevOpponent = winner === 0 ? prev.right : prev.left;
	if (prevScorer === 3 && prevOpponent < 3) {
		return { left: prev.left, right: prev.right, phase: 'normal' };
	}

	const scores: [number, number] = [prev.left, prev.right];
	if (scores[winner] < 3) scores[winner] += 1;
	return { left: scores[0], right: scores[1], phase: 'normal' };
}
