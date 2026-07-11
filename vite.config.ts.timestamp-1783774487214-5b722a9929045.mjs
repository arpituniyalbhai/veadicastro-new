// vite.config.ts
import { defineConfig } from "file:///C:/Users/bhaia/Downloads/veadicastro/vedicastro/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/bhaia/Downloads/veadicastro/vedicastro/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/bhaia/Downloads/veadicastro/vedicastro/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\bhaia\\Downloads\\veadicastro\\vedicastro";
var vite_config_default = defineConfig(({ mode }) => ({
  base: mode === "production" ? "/" : "/",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      external: ["farmhash-modern"],
      output: {
        manualChunks(id) {
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-core";
          }
          if (id.includes("react-router")) {
            return "react-router";
          }
          if (id.includes("firebase")) {
            return "firebase-vendor";
          }
          if (id.includes("@radix-ui")) {
            return "ui-radix";
          }
          if (id.includes("lucide-react")) {
            return "icons";
          }
          if (id.includes("recharts") || id.includes("embla")) {
            return "charts";
          }
          if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@tanstack")) {
            return "forms";
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
    sourcemap: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  optimizeDeps: {
    exclude: ["farmhash-modern", "firebase-admin"],
    include: ["react", "react-dom", "react-router-dom"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxiaGFpYVxcXFxEb3dubG9hZHNcXFxcdmVhZGljYXN0cm9cXFxcdmVkaWNhc3Ryb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYmhhaWFcXFxcRG93bmxvYWRzXFxcXHZlYWRpY2FzdHJvXFxcXHZlZGljYXN0cm9cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2JoYWlhL0Rvd25sb2Fkcy92ZWFkaWNhc3Ryby92ZWRpY2FzdHJvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIGJhc2U6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCIvXCIgOiBcIi9cIixcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGlcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXHJcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGV4dGVybmFsOiBbJ2Zhcm1oYXNoLW1vZGVybiddLFxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIC8vIENyaXRpY2FsIGNodW5rcyBmb3IgYWJvdmUtdGhlLWZvbGQgY29udGVudFxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdCcpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1kb20nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JlYWN0LWNvcmUnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXInKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JlYWN0LXJvdXRlcic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBEZWZlciBGaXJlYmFzZSB0byBsYXRlciBjaHVua3NcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZmlyZWJhc2UnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2ZpcmViYXNlLXZlbmRvcic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBVSSBjb21wb25lbnRzIC0gZGVmZXJcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHJhZGl4LXVpJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd1aS1yYWRpeCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2x1Y2lkZS1yZWFjdCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnaWNvbnMnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gSGVhdnkgYW5hbHl0aWNzL2NoYXJ0cyAtIGRlZmVyXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlY2hhcnRzJykgfHwgaWQuaW5jbHVkZXMoJ2VtYmxhJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdjaGFydHMnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gRm9ybXMgYW5kIHZhbGlkYXRpb24gLSBkZWZlclxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdC1ob29rLWZvcm0nKSB8fCBpZC5pbmNsdWRlcygnem9kJykgfHwgaWQuaW5jbHVkZXMoJ0B0YW5zdGFjaycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnZm9ybXMnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXHJcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcclxuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBmYWxzZSxcclxuICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGV4Y2x1ZGU6IFsnZmFybWhhc2gtbW9kZXJuJywgJ2ZpcmViYXNlLWFkbWluJ10sXHJcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgfSxcclxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlUsU0FBUyxvQkFBb0I7QUFDeFcsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLE1BQU0sU0FBUyxlQUFlLE1BQU07QUFBQSxFQUNwQyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLGVBQWU7QUFBQSxNQUNqQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxpQkFBaUI7QUFBQSxNQUM1QixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFFZixjQUFJLEdBQUcsU0FBUyxPQUFPLEtBQUssR0FBRyxTQUFTLFdBQVcsR0FBRztBQUNwRCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsVUFBVSxHQUFHO0FBQzNCLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFdBQVcsR0FBRztBQUM1QixtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsVUFBVSxLQUFLLEdBQUcsU0FBUyxPQUFPLEdBQUc7QUFDbkQsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsaUJBQWlCLEtBQUssR0FBRyxTQUFTLEtBQUssS0FBSyxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQ3BGLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUEsSUFDdkIsbUJBQW1CO0FBQUEsSUFDbkIsc0JBQXNCO0FBQUEsSUFDdEIsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxtQkFBbUIsZ0JBQWdCO0FBQUEsSUFDN0MsU0FBUyxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxFQUNwRDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
