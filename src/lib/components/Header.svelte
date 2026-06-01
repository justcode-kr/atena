<script lang="ts">
	import { onMount } from 'svelte';
	import logo from '$lib/assets/logo.svg';

	let isFullscreen = $state(false);

	function syncFullscreen() {
		isFullscreen = document.fullscreenElement !== null;
	}

	onMount(() => {
		syncFullscreen();
		document.addEventListener('fullscreenchange', syncFullscreen);
		return () => document.removeEventListener('fullscreenchange', syncFullscreen);
	});

	async function toggleFullscreen() {
		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			} else {
				await document.documentElement.requestFullscreen();
			}
		} catch {
			/* unsupported or denied */
		}
	}
</script>

<header class="header">
	<a class="brand" href="/" aria-label="테니스월드 홈">
		<!-- <img class="logo" src={logo} alt="테니스월드" /> -->
		 Atena

		 <small>scroeboard</small>
	</a>

	<button
		class="icon-btn header-fullscreen"
		type="button"
		aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}
		aria-pressed={isFullscreen}
		onclick={toggleFullscreen}
	>
		{#if isFullscreen}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 3H5a2 2 0 0 0-2 2v4" />
				<path d="M15 3h4a2 2 0 0 1 2 2v4" />
				<path d="M3 15v4a2 2 0 0 0 2 2h4" />
				<path d="M21 15v4a2 2 0 0 1-2 2h-4" />
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 9V5a2 2 0 0 1 2-2h4" />
				<path d="M21 9V5a2 2 0 0 0-2-2h-4" />
				<path d="M9 21H5a2 2 0 0 1-2-2v-4" />
				<path d="M15 21h4a2 2 0 0 0 2-2v-4" />
			</svg>
		{/if}
	</button>
</header>
