module.exports = {
  apps : [{
    name      : 'ducor-backend',
    script    : 'src/app.ts',
    env: {
      NODE_ENV: 'development'
    },
    env_production : {
      NODE_ENV: 'production'
    }
  }],
};
