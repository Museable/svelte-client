<script lang="ts">
	import audioFile from '$lib/assets/audio/sample.flac';
	import { audioEngine } from '$lib/audio/audioengine';
	import { onMount } from 'svelte';

	audioEngine.load({
		id: 'ghostrulesdeco',
		title: 'Ghost Rules',
		artist: 'DECO*27',
		album: 'Ghost',
		url: audioFile,
		artwork: 'https://placehold.co/128'
	});

	audioEngine.play();
</script>
