require "bundler/capistrano"

set :application, 'rungist'

role :web, 'rungist.com'                          # Your HTTP server, Apache/etc
role :app, 'rungist.com'                          # This may be the same as your `Web` server
role :db,  'rungist.com', :primary => true        # This is where Rails migrations will run

set :repository, "git://github.com/Djo/rungist.git"
set :scm, "git"
set :branch, "master"
set :deploy_via, :remote_cache

set :deploy_to, "/apps/#{application}"
set :use_sudo, false
set :user, 'deployer'

set :default_environment, {
  'PATH' => "/home/#{user}/.rbenv/shims:/home/#{user}/.rbenv/bin:$PATH",
  'RACK_ENV' => 'production',
  'JRUBY_OPTS' => '--1.9'
}

namespace :deploy do
  task :start, :roles => :app do
    run "sudo /usr/bin/sv start rungist"
  end

  task :restart, :roles => :app do
    run "cd #{current_path} && bundle exec pumactl -S #{shared_path}/pids/puma.state restart"
  end

  task :stop, :roles => :app do
    run "sudo /usr/bin/sv stop rungist"
    run "cd #{current_path} && bundle exec pumactl -S #{shared_path}/pids/puma.state stop"
  end
end

after 'deploy', 'deploy:cleanup'
