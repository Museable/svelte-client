<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { audioEngine } from '$lib/audio/audioengine';
	import logo from '$lib/assets/logo.svg';

	let { children } = $props();

	const audioState = audioEngine.store;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Museable • Alpha</title>
</svelte:head>

<div class="app bg-[#232724] text-white">
	<div class="container-navigation container ml-5 flex items-center">
		<img src={logo} alt="" class="h-5" />
	</div>
	<div class="container-view container">
		{@render children()}
	</div>

	<div class="container-informations container">
		<div class="box-view align-center flex overflow-hidden">
			<img src={$audioState.currentTrack?.artwork} alt="" class="rounded-[25px]" />
			<div class="track-informations ml-3 flex h-full flex-col justify-center [&]:text-xl">
				<p>{$audioState.currentTrack?.title}</p>
				<p class="text-base">
					{$audioState.currentTrack?.artist} • {$audioState.currentTrack?.album}
				</p>
			</div>
		</div>
	</div>
	<div class="container-controls container">
		<div class="box-view"></div>
	</div>
	<div class="container-actions container">
		<div class="box-view"></div>
	</div>
</div>
