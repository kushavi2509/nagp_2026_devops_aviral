# users-api

A simple REST API built with Node.js, Express, and PostgreSQL. Returns user data from a database.

## Stack

- Node.js + Express
- PostgreSQL (via `pg`)
- Docker

## Running locally

Install dependencies and start the dev server (assumes Postgres is already running on `localhost:5432`):

```bash
cp .env.example .env   # fill in your DB credentials
npm install
npm run dev
```

## Running with Docker

Create a shared network so the API container can reach Postgres by hostname:

```bash
docker network create users-net
```

Start Postgres:

```bash
docker run -d \
  --name postgres \
  --network users-net \
  -e POSTGRES_DB=usersdb \
  -e POSTGRES_USER=usersadmin \
  -e POSTGRES_PASSWORD=your_password_here \
  -p 5432:5432 \
  postgres:15
```

Build and run the API on the same network:

```bash
docker build -t users-api .

docker run -d \
  --name users-app \
  --network users-net \
  -p 3000:3000 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=usersdb \
  -e DB_USER=usersadmin \
  -e DB_PASSWORD=your_password_here \
  users-api
```

> `DB_HOST=postgres` works because both containers are on `users-net` and Docker resolves container names as hostnames on the same network.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Check if server is running |
| GET | `/users` | Get all users |

## Database

You need the `users` table created before the API can return data:

```sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100),
  email      VARCHAR(100) UNIQUE,
  role       VARCHAR(50),
  department VARCHAR(50),
  status     VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Run it against the Postgres container:

```bash
docker exec -it postgres psql -U usersadmin -d usersdb -c "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE, role VARCHAR(50), department VARCHAR(50), status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW());"
```

Then seed some data:

```bash
docker exec -it postgres psql -U usersadmin -d usersdb -c "INSERT INTO users (name, email, role, department, status) VALUES ('Alice Johnson', 'alice@example.com', 'Backend Engineer', 'Engineering', 'active'), ('Bob Smith', 'bob@example.com', 'Frontend Engineer', 'Engineering', 'active'), ('Carol White', 'carol@example.com', 'Product Manager', 'Product', 'active'), ('David Brown', 'david@example.com', 'DevOps', 'Infra', 'active'), ('Eva Martinez', 'eva@example.com', 'Data Scientist', 'Analytics', 'active'), ('Frank Lee', 'frank@example.com', 'QA Engineer', 'Engineering', 'inactive') ON CONFLICT DO NOTHING;"
```
