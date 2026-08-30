# AccessArt Infrastructure (IaC)

Everything API Gateway, authorizer, and DynamoDB lives here as code — nothing is console-only (CLAUDE.md rule 3; this closes PlanEase's known drift gap).

**Deploy** (from this directory, AWS credentials configured, region `ap-southeast-2`):

```
sam build && sam deploy --guided     # first time; later just: sam build && sam deploy
```

The stack output `ApiUrl` goes into `web/.env.local` as `VITE_API_BASE_URL` until `api.accessart.net` is set up.

In `template.yaml` now: the `accessart-api` Lambda behind one `ANY /{proxy+}` HTTP API route, CORS, and the `waitlist` / `staging_waitlist` DynamoDB tables (pay-per-request, `email` partition key, deletion-retained).

Still to come as build reaches each piece:

- Prod/staging alias + stage split (`lambdaAlias` stage variable) and custom domains `api.accessart.net` / `staging-api.accessart.net` (needs Route53 + ACM cert); REQUEST Lambda authorizer once Cognito exists.
- Table definitions (`markets`, `users`, `artworks`, `posts`, `follows`, `venues`, `placements`, `rentals`, `orders`, `payouts`, `trails` + `staging_*` twins) — keys per [../buildguide/architecture.md](../buildguide/architecture.md).
- Cognito user pool + hosted UI domain (`auth.accessart.net`).
- S3 media bucket with presigned-upload CORS config.
