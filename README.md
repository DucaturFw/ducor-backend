# Ducatur Oracles Backend

[![Build Status](https://travis-ci.org/DucaturFw/ducor-backend.svg?branch=master)](https://travis-ci.org/DucaturFw/ducor-backend)

### Docker

#### Run backend container

In project root directory, assuming you used `source .env`:

    docker build -t ducor-backend .  
    docker run --env-file=.env -p $DUCOR_API_PORT:$DUCOR_API_PORT ducor-backend

The docker image is build upon pm2 container, installs python and typescript (needed for build and run respectively).

Tests are run locally with `npm test`.