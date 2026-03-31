# Escalar para 500+ conexões simultâneas

## Status atual

O app já possui as otimizações de Fase 1 e 2:
- Pool PostgreSQL: 60 conexões
- Indexes de performance em todas as tabelas quentes
- Compression (gzip), Helmet, Rate Limiting
- Code splitting (bundle 63% menor)
- requireAuth em todas as rotas
- Batch inserts (oclusão)
- nginx otimizado (auto workers, cache, gzip)
- Health check no container

## Pendente: Node.js Cluster Mode

O Node.js roda em processo único (1 core). Para 500 usuários simultâneos com uso ativo (~1000-1500 req/s), é necessário usar todos os cores.

### Implementação

**1. Criar `server/cluster.js`:**

```js
import cluster from 'node:cluster';
import os from 'node:os';

if (cluster.isPrimary) {
  const numWorkers = Math.min(os.cpus().length, 8);
  console.log(`Primary ${process.pid}: spawning ${numWorkers} workers`);
  for (let i = 0; i < numWorkers; i++) cluster.fork();
  cluster.on('exit', (worker, code) => {
    console.error(`Worker ${worker.process.pid} died (code ${code}), restarting…`);
    cluster.fork();
  });
} else {
  await import('./index.js');
}
```

**2. Atualizar Dockerfile:**

```dockerfile
CMD ["sh", "-c", "node server/cluster.js & nginx -g 'daemon off;'"]
```

**3. Separar pool de sessões (opcional):**

Criar um pool dedicado para connect-pg-simple com 10 conexões, deixando as 60 do pool principal exclusivas para queries da aplicação.

### Capacidade estimada após cluster

| Cores | Req/s estimado | Usuários simultâneos |
|-------|---------------|---------------------|
| 2     | 400-600       | ~200-300            |
| 4     | 800-1200      | ~400-600            |
| 8     | 1600-2400     | ~800-1200           |

### Outras otimizações futuras (Fase 3+)

- **Redis para sessões** — elimina queries de sessão do PostgreSQL
- **CDN (Cloudflare)** — cache de assets na edge, reduz carga no servidor
- **Migrar imagens de oclusão para S3** — reduz I/O no banco (base64 → URL)
- **APM (Sentry/DataDog)** — monitoramento de performance em produção
- **Load testing** — k6 ou Artillery para validar sob carga real
- **Horizontal scaling** — múltiplos containers + load balancer no Coolify
