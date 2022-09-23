import App from './App.svelte';
import { loadAndStoreMyChannels } from './controller/channel';
import { createListener } from './event/listener';
import * as me from './store/me';

me.initUser();
loadAndStoreMyChannels();
createListener();

const app = new App({
	target: document.body
});

export default app;