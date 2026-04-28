# Task Manager SaaS

Aplicacao de gerenciamento de tarefas no estilo Kanban com foco em organizacao e produtividade.

## Visao do produto

O projeto entrega um fluxo completo de organizacao pessoal:

- Cadastro e login de usuario
- Quadro Kanban com colunas `To Do`, `In Progress` e `Done`
- Criacao de tarefas com descricao, prioridade e prazo
- Evolucao de status e exclusao de tarefas
- Persistencia de dados em SQLite

## Stack tecnica

- Backend: Node.js + Express
- Autenticacao: JWT + bcryptjs
- Banco de dados: SQLite (`better-sqlite3`)
- Frontend: HTML, CSS e JavaScript (servido pelo backend)

## Estrutura do projeto

- `backend/src`: API, autenticacao e camada de dados
- `backend/public`: interface web do Kanban
- `backend/data.sqlite`: banco SQLite criado automaticamente em runtime

## Como executar

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependencias:
   ```bash
   npm install
   ```
3. Configure variaveis de ambiente:
   Linux/macOS:
   ```bash
   cp .env.example .env
   ```
   Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Inicie o servidor:
   ```bash
   npm run dev
   ```
5. Abra no navegador:
   - [http://localhost:3001](http://localhost:3001)

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/boards/current`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Proximos incrementos recomendados

- Drag and drop entre colunas
- Filtros por prioridade e prazo
- Multi-board por usuario
- Testes automatizados (unitarios e integracao)
- Pipeline CI/CD e deploy em nuvem
