ENV['RACK_ENV'] = 'test'

require 'rubygems'
require 'bundler'
Bundler.require

require 'rack/test'
require_relative '../app.rb'

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
  def app; App; end
end
