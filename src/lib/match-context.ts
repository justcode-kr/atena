import { getContext, setContext } from 'svelte';
import type { Side } from '$lib/scoring/types.js';

export type MatchActions = {
	increment: (side: Side) => void;
	undo: (side: Side) => void;
};

const MATCH_ACTIONS_KEY = Symbol('match-actions');

export function setMatchActions(actions: MatchActions) {
	setContext(MATCH_ACTIONS_KEY, actions);
}

export function getMatchActions(): MatchActions {
	return getContext<MatchActions>(MATCH_ACTIONS_KEY);
}
