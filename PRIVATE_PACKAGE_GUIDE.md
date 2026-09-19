# Private Package Sales

This package can be sold to multiple companies through npm restricted access. Do not give customers the password for your npm owner account. Give every company its own npm identity and read-only access.

## One-time owner setup

1. Create or use an npm organization, for example `goy`, at [npmjs.com](https://www.npmjs.com/).
2. Confirm the package name is scoped to that organization: `@goy/esim-client`.
3. Enable two-factor authentication on the owner and organization accounts.
4. Publish the package privately:

```bash
npm login
npm run publish:private
```

The `publishConfig.access` setting and `--access restricted` prevent the package from being public. The package name must remain scoped; unscoped packages cannot be private on npm.

## Add a partner

Ask the partner to create their own npm account. Record their npm username and company in your customer access list. Then grant only read access:

```bash
npm access grant read-only PARTNER_NPM_USERNAME @goy/esim-client
```

Do this once for each customer. Do not grant `read-write`, organization owner, or publish permissions.

## Partner installation

The partner authenticates with their own npm account, then installs the package:

```bash
npm login
npm install @goy/esim-client
```

For CI/CD, the partner should create their own npm access token and store it in their CI secret manager. Their project-level `.npmrc` can use:

```ini
@goy:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

They should never commit a real token to git. A token is more appropriate than a shared username and password because it can be limited and revoked without changing anyone else's access.

## Revoke one partner

When a subscription ends, revoke that partner only:

```bash
npm access revoke PARTNER_NPM_USERNAME @goy/esim-client
```

If the partner used their own token, they should also revoke that token from their npm account. Publish a new version when you need to deliver updates; existing installed copies are already on the partner's machine.

## Important limitation

Private npm access controls who can download future package versions. It cannot technically prevent a customer from copying or inspecting JavaScript after installation. Use a written commercial license, subscription terms, and server-side licensing/API checks for stronger business enforcement. Keep valuable secrets and proprietary decisions on your backend.