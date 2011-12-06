require "sinatra/reloader" if development?
require "lib/rungist_sandbox"

set :haml, :format => :html5
set :views, File.expand_path(File.dirname(__FILE__) + '/views' )

get '/?:gist?' do
  haml :index
end

post '/run' do
  begin
    result = RungistSandbox.eval(params[:code], :language => params[:language])
    [200, result.to_s]
  rescue Sandbox::SandboxException, Sandbox::TimeoutError => ex
    [400, ex.message]
  end
end
