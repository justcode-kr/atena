<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	export type OverlayVariant = 'game' | 'match';

	type Props = {
		variant: OverlayVariant;
		winnerLabel: string;
		onComplete: () => void;
	};

	const DIM_MS = 300;
	const SLIDE_MS = 450;
	const HOLD_MS = 5000;

	let { variant, winnerLabel, onComplete }: Props = $props();

	let backdropVisible = $state(false);
	let textPhase = $state<'off-left' | 'center' | 'off-right'>('off-left');
	let exiting = $state(false);
	let done = $state(false);

	const title = $derived(variant === 'match' ? 'GAME SET!' : 'GAME!');

	let timeouts: ReturnType<typeof setTimeout>[] = [];

	function clearScheduled() {
		for (const id of timeouts) clearTimeout(id);
		timeouts = [];
	}

	function schedule(fn: () => void, ms: number) {
		timeouts.push(setTimeout(fn, ms));
	}

	function nextFrame(): Promise<void> {
		return new Promise((resolve) => {
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
		});
	}

	function finish() {
		if (done) return;
		done = true;
		clearScheduled();
		onComplete();
	}

	function runExit() {
		if (exiting || done) return;
		exiting = true;
		clearScheduled();

		textPhase = 'off-right';
		backdropVisible = false;

		schedule(finish, Math.max(SLIDE_MS, DIM_MS));
	}

	function dismiss() {
		if (exiting || done) return;
		if (!backdropVisible && textPhase === 'off-left') return;
		runExit();
	}

	onMount(async () => {
		await nextFrame();
		backdropVisible = true;

		await nextFrame();
		textPhase = 'center';

		schedule(runExit, SLIDE_MS + HOLD_MS);
	});

	onDestroy(() => {
		clearScheduled();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="overlay"
	class:overlay--match={variant === 'match'}
	class:overlay--visible={backdropVisible}
	role="button"
	tabindex="0"
	aria-label="탭하여 닫기"
	onclick={dismiss}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			dismiss();
		}
	}}
>
	<div class="text-stage">
		<div
			class="text-wrap"
			class:text-wrap--center={textPhase === 'center'}
			class:text-wrap--right={textPhase === 'off-right'}
		>
			<span class="overlay-text">{title}</span>
			{#if variant === 'match'}
				<span class="overlay-sub">{winnerLabel}</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(184, 92, 56, 0);
		backdrop-filter: blur(0);
		-webkit-backdrop-filter: blur(0);
		opacity: 0;
		pointer-events: auto;
		cursor: pointer;
		border: none;
		padding: 0;
		transition:
			opacity 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
			background 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
			backdrop-filter 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
			-webkit-backdrop-filter 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.overlay--visible {
		opacity: 1;
		background: rgba(184, 92, 56, 0.72);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.text-stage {
		width: 100%;
		max-width: 100vw;
		overflow: visible;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.text-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		transform: translateX(-120vw);
		transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
		will-change: transform;
	}

	.text-wrap--center {
		transform: translateX(0);
	}

	.text-wrap--right {
		transform: translateX(120vw);
	}

	.overlay-text {
		color: #fff;
		font-size: clamp(3rem, 14vw, 6.5rem);
		font-weight: 900;
		letter-spacing: 0.08em;
		line-height: 1;
		white-space: nowrap;
	}

	.overlay--match .overlay-text {
		font-size: clamp(3.25rem, 16vw, 7.5rem);
		text-shadow:
			0 0 40px rgba(255, 255, 255, 0.45),
			0 4px 24px rgba(0, 0, 0, 0.35);
	}

	.overlay-sub {
		color: #fff;
		font-size: clamp(1.25rem, 5vw, 2.25rem);
		font-weight: 800;
		letter-spacing: 0.12em;
		opacity: 0.95;
	}

	@media (prefers-reduced-motion: reduce) {
		.overlay {
			transition: opacity 0.2s ease;
		}

		.text-wrap {
			transform: none;
			transition: opacity 0.2s ease;
			opacity: 0;
		}

		.text-wrap--center {
			opacity: 1;
		}

		.text-wrap--right {
			opacity: 0;
		}
	}
</style>
