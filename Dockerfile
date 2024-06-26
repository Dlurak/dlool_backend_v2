FROM oven/bun:debian as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN apt-get update && apt-get install -y curl locales

RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb edgedb.toml /temp/prod/
COPY dbschema /temp/prod/dbschema
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Set up locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

RUN chown -R bun:bun /temp/prod
USER bun
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.edgedb.com | sh -s -- -y
ENV PATH="/home/bun/.local/bin:${PATH}"
EXPOSE 5173/tcp
RUN cd /temp/prod && edgedb project init --non-interactive \
	&& bun run edgedb

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/prod/dbschema dbschema
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/tsconfig.json .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ]
