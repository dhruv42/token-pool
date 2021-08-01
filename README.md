# token-pool
A service to generate and distribute tokens.

1. Generate API creates a token (nanoid + timestamp).
2. Get API assigns a token to the client, it removes the token from redis and stores in mongo (with TTL index on generationTime field).
3. Unblock API checks if token is assigned to the client, if assigned, it'll unblock the token and add it into the redis with time left.
4. Delete API removes token from redis and mongo if exists.
5. Keep alive API keeps the token assigned to the client if hit within 60s.
