require "sinatra/reloader" if development?
require 'sandbox'

set :haml, :format => :html5
set :views, File.expand_path(File.dirname(__FILE__) + '/views' )

get '/?:gist?' do
  haml :index
end

post '/run' do
  begin
    sandbox = Sandbox.safe
    sandbox.activate!
    result = sandbox.eval(params[:gist], :timeout => 1)
    [200, result.to_s]
  rescue Sandbox::SandboxException, Sandbox::TimeoutError => ex
    [400, ex.message]
  end
end
