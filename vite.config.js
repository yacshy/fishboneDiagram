import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { resolve } from "path";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue"],
      dts: "src/auto/auto-import.d.ts",
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: "src/auto/components.d.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@image": resolve(__dirname, "src/assets/image"),
      "@utils": resolve(__dirname, "src/utils"),
      "@store": resolve(__dirname, "src/store"),
    },
  },
  build: {
    // 输出目录设置为 docs
    outDir: "docs",
    // 优化打包大小
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
      },
    },
    // 开启 CSS 代码分割，将不同来源的 CSS 分离
    cssCodeSplit: true,
    // 关闭生成 source map，减小打包体积
    sourcemap: false,
    // 调整块大小警告限制
    chunkSizeWarningLimit: 1000,
    // 开启 brotli 压缩
    brotliSize: true,
    // Rollup 配置
    rollupOptions: {
      // 外部化一些依赖，不打包到 bundle 中
      external: [],
      output: {
        // 静态资源命名，使用哈希值
        assetFileNames: "assets/[name].[hash].[ext]",
        // 代码分割策略
        manualChunks: {
          // 将 Vue 相关库单独打包
          vue: ["vue", "pinia"],
          // 将 Element Plus 单独打包
          "element-plus": ["element-plus"],
          // 将 jQuery 单独打包
          jquery: ["jquery"],
          // 将工具库单独打包
          utils: ["mitt", "panzoom"],
          // 将动画库单独打包
          animate: ["animate.css"],
        },
        // 优化输出
        compact: true,
        // 减少包装代码
        hoistTransitiveImports: true,
      },
    },
  },
});
