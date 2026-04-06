import { OpenNextConfig } from '@opennextjs/aws';

const config: OpenNextConfig = {
  buildDir: '.open-next',
  compress: true,
  cloudflare: {
    imageOptimization: true,
  },
};

export default config;
