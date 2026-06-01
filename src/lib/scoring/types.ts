export type Side = 0 | 1;

export type MatchMode = 'singles' | 'doubles';

export type SetsInMatch = 1 | 3 | 5;

export type MatchFormat = {
	mode: MatchMode;
	setsInMatch: SetsInMatch;
	gamesToWinSet: number;
	winByTwo: boolean;
};

export type PointPhase = 'normal' | 'deuce' | 'advantage-left' | 'advantage-right';

export type GamePoints = {
	left: number;
	right: number;
	phase: PointPhase;
};

export type MatchScore = {
	sets: [number, number];
	games: [number, number];
	points: GamePoints;
};

export type MatchState = {
	format: MatchFormat;
	noAd: boolean;
	courtChange: boolean;
	courtSwapped: boolean;
	server: Side;
	score: MatchScore;
	matchWinner: Side | null;
};
