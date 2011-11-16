set :haml, :format => :html5
set :views, File.expand_path(File.dirname(__FILE__) + '/views' )

get '/' do
  haml :index
end
