require_relative "./spec_helper.rb"

describe "App" do
  it "should be success" do
    get '/'
    last_response.should be_ok
  end

  it "successfully returns a greeting" do
    get '/'
    last_response.body.should eq('Run gist!')
  end
end
