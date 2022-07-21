import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
      scss: {
        prependData: `@use "src/mixins.scss" as *;`
      }
    })
  ],

  kit: {
    adapter: adapter(),
    prerender: {
      default: true,
    },
    trailingSlash: 'never'
  }
};

export default config;
