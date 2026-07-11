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
    rollupOptions: {
      external: ["farmhash-modern"],
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom"],
          "react-router": ["react-router-dom"],
          "firebase-core": ["firebase/app"],
          "firebase-auth": ["firebase/auth"],
          "firebase-firestore": ["firebase/firestore"],
          "firebase-analytics": ["firebase/analytics"],
          "ui-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip"
          ],
          "lucide-icons": ["lucide-react"],
          "query-forms": [
            "@tanstack/react-query",
            "react-hook-form",
            "@hookform/resolvers",
            "zod"
          ],
          "utils": [
            "clsx",
            "class-variance-authority",
            "tailwind-merge",
            "date-fns"
          ],
          "seo-misc": [
            "react-helmet-async",
            "next-themes",
            "sonner"
          ],
          "charts-ui": [
            "recharts",
            "embla-carousel-react"
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  optimizeDeps: {
    exclude: ["farmhash-modern", "firebase-admin"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxiaGFpYVxcXFxEb3dubG9hZHNcXFxcdmVhZGljYXN0cm9cXFxcdmVkaWNhc3Ryb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYmhhaWFcXFxcRG93bmxvYWRzXFxcXHZlYWRpY2FzdHJvXFxcXHZlZGljYXN0cm9cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2JoYWlhL0Rvd25sb2Fkcy92ZWFkaWNhc3Ryby92ZWRpY2FzdHJvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIGJhc2U6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCIvXCIgOiBcIi9cIixcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGlcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGV4dGVybmFsOiBbJ2Zhcm1oYXNoLW1vZGVybiddLFxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgICdyZWFjdC1jb3JlJzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcclxuICAgICAgICAgICdyZWFjdC1yb3V0ZXInOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICdmaXJlYmFzZS1jb3JlJzogWydmaXJlYmFzZS9hcHAnXSxcclxuICAgICAgICAgICdmaXJlYmFzZS1hdXRoJzogWydmaXJlYmFzZS9hdXRoJ10sXHJcbiAgICAgICAgICAnZmlyZWJhc2UtZmlyZXN0b3JlJzogWydmaXJlYmFzZS9maXJlc3RvcmUnXSxcclxuICAgICAgICAgICdmaXJlYmFzZS1hbmFseXRpY3MnOiBbJ2ZpcmViYXNlL2FuYWx5dGljcyddLFxyXG4gICAgICAgICAgJ3VpLXJhZGl4JzogW1xyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvbicsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtY2hlY2tib3gnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNvbGxhcHNpYmxlJyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWxhYmVsJyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1wb3BvdmVyJyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1yYWRpby1ncm91cCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0JyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zZXBhcmF0b3InLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNsb3QnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXN3aXRjaCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdGFicycsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdG9hc3QnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvb2x0aXAnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdsdWNpZGUtaWNvbnMnOiBbJ2x1Y2lkZS1yZWFjdCddLFxyXG4gICAgICAgICAgJ3F1ZXJ5LWZvcm1zJzogW1xyXG4gICAgICAgICAgICAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JyxcclxuICAgICAgICAgICAgJ3JlYWN0LWhvb2stZm9ybScsXHJcbiAgICAgICAgICAgICdAaG9va2Zvcm0vcmVzb2x2ZXJzJyxcclxuICAgICAgICAgICAgJ3pvZCcsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgJ3V0aWxzJzogW1xyXG4gICAgICAgICAgICAnY2xzeCcsXHJcbiAgICAgICAgICAgICdjbGFzcy12YXJpYW5jZS1hdXRob3JpdHknLFxyXG4gICAgICAgICAgICAndGFpbHdpbmQtbWVyZ2UnLFxyXG4gICAgICAgICAgICAnZGF0ZS1mbnMnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdzZW8tbWlzYyc6IFtcclxuICAgICAgICAgICAgJ3JlYWN0LWhlbG1ldC1hc3luYycsXHJcbiAgICAgICAgICAgICduZXh0LXRoZW1lcycsXHJcbiAgICAgICAgICAgICdzb25uZXInLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdjaGFydHMtdWknOiBbXHJcbiAgICAgICAgICAgICdyZWNoYXJ0cycsXHJcbiAgICAgICAgICAgICdlbWJsYS1jYXJvdXNlbC1yZWFjdCcsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXHJcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXhjbHVkZTogWydmYXJtaGFzaC1tb2Rlcm4nLCAnZmlyZWJhc2UtYWRtaW4nXSxcclxuICB9LFxyXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUEyVSxTQUFTLG9CQUFvQjtBQUN4VyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsTUFBTSxTQUFTLGVBQWUsTUFBTTtBQUFBLEVBQ3BDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDOUUsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLGlCQUFpQjtBQUFBLE1BQzVCLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLGNBQWMsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUNuQyxnQkFBZ0IsQ0FBQyxrQkFBa0I7QUFBQSxVQUNuQyxpQkFBaUIsQ0FBQyxjQUFjO0FBQUEsVUFDaEMsaUJBQWlCLENBQUMsZUFBZTtBQUFBLFVBQ2pDLHNCQUFzQixDQUFDLG9CQUFvQjtBQUFBLFVBQzNDLHNCQUFzQixDQUFDLG9CQUFvQjtBQUFBLFVBQzNDLFlBQVk7QUFBQSxZQUNWO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsVUFDQSxnQkFBZ0IsQ0FBQyxjQUFjO0FBQUEsVUFDL0IsZUFBZTtBQUFBLFlBQ2I7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsVUFDQSxTQUFTO0FBQUEsWUFDUDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLFlBQVk7QUFBQSxZQUNWO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsVUFDQSxhQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSx1QkFBdUI7QUFBQSxJQUN2QixtQkFBbUI7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLG1CQUFtQixnQkFBZ0I7QUFBQSxFQUMvQztBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
