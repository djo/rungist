require 'rubygems'
require 'bundler'
Bundler.require

namespace :assets do
  desc 'Compile assets'
  task :compile do
    sprockets = Sprockets::Environment.new
    sprockets.append_path 'app/javascripts'
    sprockets.append_path 'app/stylesheets'

    files = { 'javascripts' => ['application.js', 'test.js'],
              'stylesheets' => ['application.css'] }

    files.each do |folder, names|
      outpath = File.join(File.dirname(__FILE__), 'public', folder)
      names.each do |name|
        asset = sprockets[name]
        outfile = Pathname.new(outpath).join(name)
        asset.write_to(outfile)
      end
    end
  end
end
