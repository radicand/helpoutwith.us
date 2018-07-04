#!/bin/sh

sed -i 's!gqlApiEndpoint:"[^"]*"!gqlApiEndpoint:"'$GC_URL'"!' /app/public/app.js
sed -i 's!name="google-signin-client_id" content="[^"]*"!name="google-signin-client_id" content="'$GOOGLE_CLIENT_ID'"!' /app/public/index.html

WEB_ROOT=/app/public node server
