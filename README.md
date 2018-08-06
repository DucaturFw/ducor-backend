# Ducatur Oracles Backend

[![Build Status](https://travis-ci.org/DucaturFw/ducor-backend.svg?branch=master)](https://travis-ci.org/DucaturFw/ducor-backend)

### Docker

#### Run backend container

In project root directory, assuming you used `export $(cat .env | xargs)`:

    docker build -t ducor-backend .  
    docker run -p $DUCOR_API_PORT:$DUCOR_API_PORT ducor-backend

The docker image is build upon pm2 container, installs python and typescript (needed for build and run respectively).

Tests are run locally with `npm test`.

#### Docker Compose

Assuming, you have ducor-frontend nearby cloned (`../ducor-frontend`):

    docker-compose up -d

For tests:

    docker-compose -f docker-compose.test.yml up
