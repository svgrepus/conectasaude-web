# Dockerfile para ConectaSaúde Backend
# Este Dockerfile cria um container com todas as ferramentas necessárias
# para desenvolvimento e deploy do sistema ConectaSaúde

# ========================================
# ESTÁGIO BASE
# ========================================
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    git \
    postgresql-client \
    curl \
    bash \
    jq

# Configurar diretório de trabalho
WORKDIR /app

# ========================================
# ESTÁGIO DE DEPENDÊNCIAS
# ========================================
FROM base AS deps

# Copiar arquivos de configuração
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# ========================================
# ESTÁGIO DE DESENVOLVIMENTO
# ========================================
FROM base AS development

# Instalar Supabase CLI
RUN npm install -g supabase@latest

# Instalar outras ferramentas úteis
RUN npm install -g \
    @types/node \
    typescript \
    tsx \
    nodemon

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Expor portas
EXPOSE 3000 54321 54322 54323 54324

# Comando padrão para desenvolvimento
CMD ["npm", "run", "dev"]

# ========================================
# ESTÁGIO DE BUILD
# ========================================
FROM base AS builder

# Copiar dependências
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Build da aplicação (se houver frontend)
RUN npm run build 2>/dev/null || echo "No build script found"

# ========================================
# ESTÁGIO DE PRODUÇÃO
# ========================================
FROM base AS production

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar dependências de produção
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY --chown=nextjs:nodejs . .

# Configurar usuário
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando padrão
CMD ["npm", "start"]

# ========================================
# ESTÁGIO DE MIGRAÇÕES
# ========================================
FROM base AS migrations

# Instalar Supabase CLI
RUN npm install -g supabase@latest

# Copiar arquivos de migração
COPY sql/ ./sql/
COPY functions/ ./functions/
COPY supabase/ ./supabase/

# Script de entrada para migrações
COPY docker-migration-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Comando para executar migrações
CMD ["./entrypoint.sh"]

# ========================================
# METADADOS DA IMAGEM
# ========================================

# Labels para organização
LABEL maintainer="ConectaSaúde Team"
LABEL version="1.0.0"
LABEL description="Backend completo para Sistema de Secretaria de Saúde Municipal"
LABEL org.opencontainers.image.title="ConectaSaúde Backend"
LABEL org.opencontainers.image.description="Sistema completo de gestão para Secretaria Municipal de Saúde"
LABEL org.opencontainers.image.vendor="Secretaria Municipal de Saúde"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/seu-usuario/conectasaude"

# ========================================
# VOLUMES
# ========================================

# Volume para dados persistentes
VOLUME ["/app/data"]

# Volume para logs
VOLUME ["/app/logs"]

# Volume para backups
VOLUME ["/app/backups"]

# ========================================
# VARIÁVEIS DE AMBIENTE PADRÃO
# ========================================

ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info
