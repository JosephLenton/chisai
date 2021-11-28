import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    sourcemap: true,
    format: 'es'
  },
  external: [
    'react',
    'react-dom',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      exclude: [
        "**/__tests__",
        "**/*.test.ts",
      ],
    })
  ],
  onwarn: warning => {
    throw new Error(warning.message);
  },
}
