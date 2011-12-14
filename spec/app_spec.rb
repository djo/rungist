require_relative "./spec_helper.rb"

describe "App" do

  context "/" do
    it "should be success" do
      get '/'
      last_response.should be_ok
    end
  end

  context "/about" do
    it "should be success" do
      get '/about'
      last_response.should be_ok
    end
  end

end
