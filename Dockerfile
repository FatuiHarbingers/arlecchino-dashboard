# Base Stage
FROM node:18-alpine3.15 AS base

ARG DOPPLER_TOKEN
WORKDIR /home/node/app

ENV NODE_ENV="development"
ENV CI=true

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories

RUN apk add -u --no-cache \
	dumb-init \
	fontconfig \
	jq \
	nodejs \
    doppler \
	git \
	openssh

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarn/ .yarn/
COPY --chown=node:node doppler.yaml .
RUN sed -i 's/dev/prd/g' doppler.yaml
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node static/ static/
COPY --chown=node:node svelte.config.js .
COPY --chown=node:node vite.config.ts .
# Remove global cache config line
RUN echo "$(tail -n +2 .yarnrc.yml)" > .yarnrc.yml

ENTRYPOINT [ "dumb-init", "--" ]

# Build Stage
FROM base AS builder

WORKDIR /home/node/app

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.json tsconfig.json

ARG GH_TOKEN
RUN git config --global url."https://$GH_TOKEN@github.com/".insteadOf ssh://git@github.com/
RUN yarn install --immutable

COPY --chown=node:node src/ src/
RUN doppler run yarn run build

# Runner Stage
FROM base AS runner

WORKDIR /home/node/app

ENV NODE_ENV="production"

COPY --chown=node:node --from=builder /home/node/app/dist dist
# COPY --chown=node:node --from=builder /home/node/app/node_modules node_modules

ARG GH_TOKEN
RUN git config --global url."https://$GH_TOKEN@github.com/".insteadOf ssh://git@github.com/
RUN yarn workspaces focus --all --production
RUN chown node:node /home/node/app

USER node
# EXPOSE 3000

ENV CI=
CMD [ "doppler", "run", "--", "yarn", "node", "dist" ]
