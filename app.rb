require "sinatra/reloader" if development?
require 'sinatra/assetpack'
require "lib/rungist_sandbox"

class App < Sinatra::Base
  set :haml, :format => :html5
  set :views, File.expand_path(File.dirname(__FILE__) + '/views' )
  set :root, File.dirname(__FILE__)

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

    css :app, ['/css/*.css']
  }

  get '/about' do
    haml :about
  end

  get '/?:gist?' do
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
