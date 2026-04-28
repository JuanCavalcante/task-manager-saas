# Task Manager SaaS

Aplicacao de gerenciamento de tarefas no estilo Kanban com foco em organizacao e produtividade.

## Status

Projeto funcional para portfolio com:

- Autenticacao de usuarios (cadastro e login)
- Quadro Kanban com colunas `To Do`, `In Progress` e `Done`
- Criacao, atualizacao de status e exclusao de tarefas
- Priorizacao de tarefas (`low`, `medium`, `high`)
- Persistencia local com SQLite
- Frontend web servido pelo backend

## Stack

- Backend: Node.js + Express
- Banco de dados: SQLite (`better-sqlite3`)
- Autenticacao: JWT + bcrypt
- Frontend: HTML, CSS e JavaScript

## Estrutura

- `backend/src`: API, autenticacao e camada de dados
- `backend/public`: interface web do Kanban
- `backend/data.sqlite`: banco SQLite criado automaticamente

## Como rodar localmente

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependencias:
   ```bash
   npm install
   ```
3. Crie seu arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```
4. Inicie a aplicacao:
   ```bash
   npm run dev
   ```
5. Acesse no navegador:
   - [http://localhost:3001](http://localhost:3001)

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/boards/current`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Roadmap sugerido

- Multi-board por usuario
- Filtros por prioridade e prazo
- Arrastar e soltar entre colunas
- Cobertura de testes (unitarios e integracao)
- Deploy com CI/CD
