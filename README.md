# helpoutwith.us

A modern webapp to help manage signups and volunteering for groups and organizations. Featuring:

- React 16.4
- Apollo (GraphQL)
- HAPI 17
- Graph.cool BaaS
- Mailjet (SaaS email notifications)
- Fuse-box bundler
- Material UI 1.x
- TypeScript

> Found this useful? give it a :star:

## get started

1.  Check out the graph.cool database schema here: [https://github.com/radicand/helpoutwith.us-gcf](https://github.com/radicand/helpoutwith.us-gcf) and follow the instructions regarding setting up the .envrc file properly before publishing the schema.
2.  Create a new graph.cool project, and publish the schema there.
3.  Create an .envrc file from the provided .envrc.example, and fill in your graph.cool URL, your graph.cool notification root token (from `gcf root-token notifications`), and a Google OAuth Client ID (https://support.google.com/cloud/answer/6158849?hl=en).
4.  Install direnv and configure it in your bash (https://github.com/direnv/direnv) - be sure to follow the Setup portion where you add the line to your bashrc.
5.  Run `direnv allow` to set the environmental variables
6.  $ `yarn` (install yarn if you haven't yet https://yarnpkg.com/en/)

## run tasks

- $ `yarn dev` (local development w/ server)
- $ `yarn prod && yarn start` (optimized build)
- $ `yarn docker:build` (optimized build and create docker image for arm32v7)

## access

The webapp will load up on http://localhost:3000 by default for both prod and dev. You'll want to proxy your Apache/Nginx server to this for production use.

## notes

I used https://github.com/codeBelt/typescript-hapi-react-hot-loader-example for most of the boilerplate, and ended up ripping out the SSR feature set as it a) caused too much headache to maintain, and b) offered very little benefit on the client-side vs. without. The codebase differs too much now to keep tracking it, but it's a good boilerplate if this is your stack.

## some search keywords

volunteer signup site, signup tracker, group activity signups
