import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Só os vendors que TODA página precisa ganham chunk nomeado.
        //
        // Nomear um chunk aqui o torna importação estática do entry — ele
        // passa a ser baixado no primeiro acesso mesmo que só apareça em uma
        // rota lazy. Medido neste projeto: com 'tiptap' nomeado, os 383 kB do
        // editor entravam na carga inicial; sem a regra, o rolldown os
        // agrupa em CollaboratorForm e eles só chegam ao abrir o formulário.
        //
        // Por isso tiptap, dnd-kit e lucide-react ficam de fora: o
        // fatiamento natural pelas fronteiras de React.lazy já os isola, e
        // melhor. firebase e @tanstack ficam porque AuthContext e
        // QueryClientProvider carregam em toda rota — aqui o chunk nomeado
        // só ajuda o cache entre deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase'
          if (id.includes('/@tanstack/')) return 'react-query'
        },
      },
    },
  },
})
