# Player2 Admin Panel — production image.
# The app is static (native ES modules), so we just serve it with nginx on
# port 3005. nginx also reverse-proxies /api, /media and /static to the backend
# using its Docker service name, which removes CORS entirely in the compose
# setup. env.js is (re)written at container start from $API_BASE so the same
# image works across environments without a rebuild.
FROM nginx:1.27-alpine

# Static app files
COPY index.html /usr/share/nginx/html/index.html
COPY env.js     /usr/share/nginx/html/env.js
COPY src        /usr/share/nginx/html/src

# nginx workers run as the unprivileged `nginx` user; make sure every file is
# world-readable and every directory is world-traversable, otherwise requests
# under /src/** fail with "stat() ... (13: Permission denied)".
RUN chmod -R a+rX /usr/share/nginx/html

# nginx site config as a template (the base image runs envsubst on
# /etc/nginx/templates/*.template at startup, substituting ${BACKEND_HOST}/${BACKEND_PORT}).
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template

# Runtime env.js writer (base image executes /docker-entrypoint.d/*.sh before nginx starts)
COPY docker/40-write-env.sh /docker-entrypoint.d/40-write-env.sh
RUN chmod +x /docker-entrypoint.d/40-write-env.sh

# Defaults (override via compose/env):
#   API_BASE   "" -> browser calls same-origin; nginx proxies to the backend.
#   BACKEND_*  the Docker service name/port of the backend.
ENV API_BASE="" \
    APP_NAME="Player2 Admin" \
    BACKEND_HOST="web" \
    BACKEND_PORT="8000"

EXPOSE 3005

# Inherit the nginx base image's entrypoint (templating + our env.js script) and CMD.
