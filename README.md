# token-pool
A service to generate and distribute tokens.

1. POST - `/api/token` - Generate API creates a token (nanoid + timestamp).
2. GET - `/api/token` - Get API assigns a token to the client, it removes the token from redis and stores in mongo (with TTL index on generationTime field).
3. PUT - `/api/token/unblock` - Unblock API checks if token is assigned to the client, if assigned, it'll unblock the token and add it into the redis with time left.
4. DELETE - `/api/token` - Delete API removes token from redis and mongo if exists.
5. PUT - `/api/token/keep-alive` - Keep alive API keeps the token assigned to the client if hit within 60s.
