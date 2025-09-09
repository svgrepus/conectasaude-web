import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

const PORT = 3000;

console.log(`🚀 Servidor de documentação iniciado em http://localhost:${PORT}`);
console.log(`📖 Acesse a documentação Swagger em: http://localhost:${PORT}/docs/api/`);

await serve((req: Request) => {
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
    enableCors: true,
  });
}, { port: PORT });
