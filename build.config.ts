import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/ts/index'],
  // Bootstrap 保持在依赖里，但 ESM/CJS 产物不内联它；宿主自行解析 bootstrap。
  // 浏览器 IIFE 产物由 esbuild 单独打包，允许内联 Modal 逻辑。
  externals: ['vite', 'bootstrap', 'bootstrap/js/dist/modal'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
});
