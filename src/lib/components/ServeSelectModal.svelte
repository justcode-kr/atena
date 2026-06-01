<script lang="ts">
	import type { MatchFormat, Side } from '$lib/scoring/types.js';

	type Props = {
		open: boolean;
		format: MatchFormat;
		onClose: () => void;
		onConfirm: (server: Side) => void;
	};

	let { open, format, onClose, onConfirm }: Props = $props();

	let draftServer = $state<Side>(0);

	$effect(() => {
		if (open) draftServer = 0;
	});

	const teamA = $derived(format.mode === 'doubles' ? 'A팀' : 'A');
	const teamB = $derived(format.mode === 'doubles' ? 'B팀' : 'B');

	function handleConfirm() {
		onConfirm(draftServer);
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
			aria-labelledby="serve-title"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 id="serve-title">첫 서브</h2>
			<p class="hint">이번 게임의 첫 서브를 선택하세요.</p>

			<div class="field">
				<span class="field-label">서브권</span>
				<div class="segmented" role="group" aria-label="서브권">
					<button
						type="button"
						aria-pressed={draftServer === 0}
						onclick={() => (draftServer = 0)}>{teamA}</button
					>
					<button
						type="button"
						aria-pressed={draftServer === 1}
						onclick={() => (draftServer = 1)}>{teamB}</button
					>
				</div>
			</div>

			<div class="modal-actions">
				<button type="button" class="btn-secondary" onclick={onClose}>취소</button>
				<button type="button" class="btn-primary" onclick={handleConfirm}>시작</button>
			</div>
		</div>
	</div>
{/if}
