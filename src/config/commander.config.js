import { Command } from 'commander';

export default function configureCommander() {
  const command = new Command();
  command
    .option('-e, --env <env>', 'Environment', 'dev')
    .parse(process.argv);

  const options = command.opts();
  const envOption = process.env.NODE_ENV || options.env || 'dev';

  const validEnvironments = ['dev', 'qa', 'prod'];
  const env = validEnvironments.includes(envOption) ? envOption : 'dev';

  process.env.NODE_ENV = env;

  return env;
}