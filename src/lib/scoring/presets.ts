import type { MatchFormat } from './types.js';

export const INTERNATIONAL_FORMAT: MatchFormat = {
	mode: 'doubles',
	setsInMatch: 3,
	gamesToWinSet: 6,
	winByTwo: true
};

export const CLUB_FORMAT: MatchFormat = {
	mode: 'doubles',
	setsInMatch: 1,
	gamesToWinSet: 4,
	winByTwo: false
};
