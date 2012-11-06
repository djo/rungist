pidfile "#{File.dirname(__FILE__)}/../tmp/puma/pid"
state_path "#{File.dirname(__FILE__)}/../tmp/puma/state"
activate_control_app
bind 'tcp://127.0.0.1:9292'
threads 0, 3
