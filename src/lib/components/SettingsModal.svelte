<script lang="ts">
	import { CLUB_FORMAT, INTERNATIONAL_FORMAT } from '$lib/scoring/presets.js';
	import type { MatchFormat, MatchMode, SetsInMatch } from '$lib/scoring/types.js';

	type Props = {
		open: boolean;
		format: MatchFormat;
		noAd: boolean;
		courtChange: boolean;
		onClose: () => void;
		onApply: (format: MatchFormat, noAd: boolean, courtChange: boolean) => void;
	};

	let { open, format, noAd, courtChange, onClose, onApply }: Props = $props();

	let draft = $state<MatchFormat>(INTERNATIONAL_FORMAT);
	let draftNoAd = $state(false);
	let draftCourtChange = $state(false);

	$effect(() => {
		if (open) {
			draft = { ...format };
			draftNoAd = noAd;
			draftCourtChange = courtChange;
		}
	});

	function applyPreset(preset: MatchFormat) {
		draft = { ...preset };
	}

	function setMode(mode: MatchMode) {
		draft = { ...draft, mode };
	}

	function setSets(setsInMatch: SetsInMatch) {
		draft = {
			...draft,
			setsInMatch,
			winByTwo: setsInMatch === 1 && draft.gamesToWinSet === 4 ? false : draft.winByTwo
		};
	}

	function setGamesToWin(games: number) {
		const winByTwo = games >= 6;
		draft = { ...draft, gamesToWinSet: games, winByTwo };
	}

	function handleApply() {
		onApply(draft, draftNoAd, draftCourtChange);
		onClose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-backdrop" role="presentation" onclick={onClose}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="modal"
			role="dialog"
			tabindex="-1"
			aria-labelledby="settings-title"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 id="settings-title">경기 설정</h2>

			<div class="presets">
				<button type="button" onclick={() => applyPreset(INTERNATIONAL_FORMAT)}>국제 규칙</button>
				<button type="button" onclick={() => applyPreset(CLUB_FORMAT)}>동호회</button>
			</div>

			<div class="field">
				<span class="field-label">경기 유형</span>
				<div class="segmented" role="group" aria-label="경기 유형">
					<button
						type="button"
						aria-pressed={draft.mode === 'singles'}
						onclick={() => setMode('singles')}>단식</button
					>
					<button
						type="button"
						aria-pressed={draft.mode === 'doubles'}
						onclick={() => setMode('doubles')}>복식</button
					>
				</div>
			</div>

			<div class="field">
				<span class="field-label">세트 수</span>
				<div class="segmented" role="group" aria-label="세트 수">
					{#each [1, 3, 5] as sets (sets)}
						<button
							type="button"
							aria-pressed={draft.setsInMatch === sets}
							onclick={() => setSets(sets as SetsInMatch)}>{sets}세트</button
						>
					{/each}
				</div>
			</div>

			<div class="field">
				<span class="field-label">세트 승리 (게임 선취)</span>
				<div class="segmented" role="group" aria-label="세트 승리 게임 수">
					<button
						type="button"
						aria-pressed={draft.gamesToWinSet === 4}
						onclick={() => setGamesToWin(4)}>4게임</button
					>
					<button
						type="button"
						aria-pressed={draft.gamesToWinSet === 6}
						onclick={() => setGamesToWin(6)}>6게임</button
					>
				</div>
				<p class="hint">
					{draft.gamesToWinSet === 4
						? '4게임을 먼저 내면 세트 종료 (4-4 불가)'
						: '6게임 선취, 2게임 차이로 승리'}
				</p>
			</div>

			<div class="field">
				<span class="field-label">듀스 규칙</span>
				<div class="segmented" role="group" aria-label="듀스 규칙">
					<button
						type="button"
						aria-pressed={!draftNoAd}
						onclick={() => (draftNoAd = false)}>Ad</button
					>
					<button
						type="button"
						aria-pressed={draftNoAd}
						onclick={() => (draftNoAd = true)}>노애드</button
					>
				</div>
				<p class="hint">
					{draftNoAd
						? '40-40 이후 다음 포인트로 게임 승부 (Ad 없음)'
						: '40-40 이후 Ad·듀스로 게임 승부'}
				</p>
			</div>

			<div class="field">
				<span class="field-label">코트 체인지</span>
				<div class="segmented" role="group" aria-label="코트 체인지">
					<button
						type="button"
						aria-pressed={!draftCourtChange}
						onclick={() => (draftCourtChange = false)}>끔</button
					>
					<button
						type="button"
						aria-pressed={draftCourtChange}
						onclick={() => (draftCourtChange = true)}>켬</button
					>
				</div>
				<p class="hint">세트 내 홀수 게임(1, 3, 5…) 종료 후 코트 변경 (국제 규칙)</p>
			</div>

			<div class="modal-actions">
				<button type="button" class="btn-secondary" onclick={onClose}>취소</button>
				<button type="button" class="btn-primary" onclick={handleApply}>적용</button>
			</div>
		</div>
	</div>
{/if}
