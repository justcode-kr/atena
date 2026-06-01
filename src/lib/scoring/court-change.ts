/** 세트 내 누적 게임 수가 홀수일 때 코트 체인지 (국제 규칙) */
export function isCourtChangeGame(games: [number, number]): boolean {
	return (games[0] + games[1]) % 2 === 1;
}
