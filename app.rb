set :haml, :format => :html5
set :views, File.expand_path(File.dirname(__FILE__) + '/views' )

get '/?:gist?' do
  haml :index
end
