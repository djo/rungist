require_relative "./spec_helper.rb"

describe "App" do
  it "should be success" do
    get '/'
    last_response.should be_ok
  end
end
