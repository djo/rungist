require 'sinatra/reloader' if development?
require 'lib/rungist_sandbox'
require 'lib/simple_cache'

class App < Sinatra::Base
  set :haml, :format => :html5
  set :views, File.expand_path(File.dirname(__FILE__) + '/views')
  set :root, File.dirname(__FILE__)

  register Sinatra::SimpleCache

  get '/' do
    cache haml(:index), 'index.html'
  end

  get '/about' do
    cache haml(:about), 'about.html'
  end

  get '/:gist' do
    haml :index
  end

  post '/run' do
    begin
      result = RungistSandbox.run(params[:code], :language => params[:language])
      [200, result.to_s]
    rescue Sandbox::SandboxException, Sandbox::TimeoutError => ex
      [400, ex.message]
    end
  end

  helpers do
    def partial(page, options={})
      haml :"_#{page}", options.merge!(:layout => false)
    end
  end

end
