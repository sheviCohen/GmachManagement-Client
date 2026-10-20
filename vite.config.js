import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// פורט 5173 הוא ברירת המחדל של Vite, והשרת מאשר (CORS) בדיוק את הכתובת הזו
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
