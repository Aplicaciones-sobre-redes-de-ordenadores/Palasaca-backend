const isDocker = !!process.env.DOCKER_ENV; // por ejemplo, si pones DOCKER_ENV=1 en env_file

if (!isDocker) {
  require('dotenv').config({ path: '.env.test' });
}
