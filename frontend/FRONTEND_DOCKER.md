# Docker no Frontend com Vite, React e Tailwind

## Dockerfile.dev

O **Dockerfile.dev** é utilizado para o ambiente de desenvolvimento. Ele:

- Baseia-se na imagem `node:18-alpine`, que é leve e rápida.
- Define `/app` como diretório de trabalho.
- Copia os arquivos de dependências e instala todas elas.
- Copia o restante do código-fonte para dentro do container.
- Expõe a porta 5173, padrão do Vite.
- Inicia o servidor de desenvolvimento usando `npm run dev`.

**Observação:**  
Certifique-se de que no arquivo `vite.config.ts`, o servidor está configurado para escutar em `0.0.0.0`:

```ts
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
```
