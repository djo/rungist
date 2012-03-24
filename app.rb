require 'sinatra/reloader' if development?
require 'sinatra/assetpack'
require 'lib/rungist_sandbox'
require 'lib/simple_cache'

class App < Sinatra::Base
  set :haml, :format => :html5
  set :views, File.expand_path(File.dirname(__FILE__) + '/views' )
  set :root, File.dirname(__FILE__)

  # All GET requests (to assets and pages) are cached.
  # Requests to the '/:gist' will be internal redirected to the index.html.
  register Sinatra::SimpleCache
  register Sinatra::AssetPack

  assets {
    js :application, [
      '/js/jquery.js',
      '/js/underscore.js',
      '/js/json2.js',
      '/js/backbone.js',
      '/js/backbone.localStorage.js',
      '/js/highlight.pack.js',
      '/js/autoheight.js',
      '/js/rungist.js'
    ]

    js :test, [
      '/js/stubgetjson.js'
    ]

    css :app, ['/css/*.css']
  }

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

end
