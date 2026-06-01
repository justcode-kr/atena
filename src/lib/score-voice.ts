import type { GamePoints, Side } from './scoring/types.js';

/** score_voice.mp3 클립 구간 (초) — 무음 구간 분석 + 순서 보정 */
export type ScoreVoiceKey =
	| 'love'
	| '15'
	| '30'
	| '40'
	| 'game'
	| '15-love'
	| '15-all'
	| '15-30'
	| '15-40'
	| '30-love'
	| '30-15'
	| '30-all'
	| '30-40'
	| '40-love'
	| '40-15'
	| '40-30'
	| 'deuce';

const SEGMENTS: Record<ScoreVoiceKey, { start: number; end: number }> = {
	love: { start: 0.12, end: 1.14 },
	'15': { start: 1.97, end: 2.91 },
	'30': { start: 3.76, end: 4.69 },
	'40': { start: 5.39, end: 5.87 },
	game: { start: 5.39, end: 5.87 },
	'15-love': { start: 6.51, end: 7.24 },
	'15-all': { start: 8.01, end: 8.79 },
	'15-30': { start: 9.6, end: 10.49 },
	'15-40': { start: 11.31, end: 12.23 },
	'30-love': { start: 13.01, end: 13.65 },
	'30-15': { start: 14.43, end: 15.26 },
	'30-all': { start: 15.99, end: 16.63 },
	'30-40': { start: 17.42, end: 18.22 },
	'40-love': { start: 18.95, end: 19.62 },
	'40-15': { start: 20.39, end: 21.25 },
	'40-30': { start: 21.99, end: 22.78 },
	deuce: { start: 23.4, end: 24.04 }
};

const SCORE_SRC = '/score_voice.mp3';

let audio: HTMLAudioElement | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

function getAudio(): HTMLAudioElement | null {
	if (typeof window === 'undefined') return null;
	if (!audio) {
		audio = new Audio(SCORE_SRC);
		audio.preload = 'auto';
	}
	return audio;
}

function clearStopTimer() {
	if (stopTimer !== null) {
		clearTimeout(stopTimer);
		stopTimer = null;
	}
}

/** 서버 점수 → 리시버 점수 순으로 보이스 클립 선택 */
export function resolveScoreVoiceKey(points: GamePoints, server: Side): ScoreVoiceKey | null {
	if (points.phase === 'deuce') return 'deuce';
	if (points.phase === 'advantage-left' || points.phase === 'advantage-right') {
		return 'deuce';
	}

	const s = server === 0 ? points.left : points.right;
	const r = server === 0 ? points.right : points.left;

	if (s === 0 && r > 0) {
		const loveSideKeys: ScoreVoiceKey[] = ['love', '15', '30', '40'];
		return loveSideKeys[r - 1] ?? null;
	}

	const map: Record<string, ScoreVoiceKey> = {
		'1-0': '15-love',
		'1-1': '15-all',
		'1-2': '15-30',
		'1-3': '15-40',
		'2-0': '30-love',
		'2-1': '30-15',
		'2-2': '30-all',
		'2-3': '30-40',
		'3-0': '40-love',
		'3-1': '40-15',
		'3-2': '40-30',
		'3-3': 'deuce'
	};

	return map[`${s}-${r}`] ?? null;
}

export function playScoreVoice(key: ScoreVoiceKey) {
	const el = getAudio();
	if (!el) return;

	const segment = SEGMENTS[key];
	clearStopTimer();
	el.pause();

	const play = () => {
		el.currentTime = segment.start;
		void el.play().catch(() => {
			/* autoplay policy 등 */
		});
		stopTimer = setTimeout(() => {
			el.pause();
			stopTimer = null;
		}, (segment.end - segment.start) * 1000 + 50);
	};

	if (el.readyState >= 2) {
		play();
		return;
	}

	el.addEventListener('canplaythrough', play, { once: true });
	void el.load();
}

export function announcePoints(points: GamePoints, server: Side) {
	const key = resolveScoreVoiceKey(points, server);
	if (key) playScoreVoice(key);
}

export function announceGame() {
	playScoreVoice('game');
}

export function stopScoreVoice() {
	clearStopTimer();
	const el = getAudio();
	if (el) el.pause();
}
