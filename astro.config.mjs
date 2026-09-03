// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), icon()],

  vite: {
    plugins: [tailwindcss()]
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500, 700, 800],
      styles: ['normal'],
    },
    {
      provider: fontProviders.google(),
      name: 'Orbitron',
      cssVariable: '--font-orbitron',
      weights: [600, 700, 900],
      styles: ['normal'],
    },
    {
      provider: fontProviders.local(),
      name: 'KH Dot Akihabara',
      cssVariable: '--font-akihabara-src',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/KH-Dot-Akihabara-16.ttf'],
          },
        ],
      },
    },
  ],
});