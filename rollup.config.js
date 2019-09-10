import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';

const pkg = require('./package.json');

export default {
  input: 'src/index.ts',
  plugins: [
    typescript(),
    babel(),
  ],
  external: Object.keys(pkg.dependencies),
  output: [
    {
      exports: 'named',
      format: 'cjs',
      file: pkg.main,
    },
  ],
};
