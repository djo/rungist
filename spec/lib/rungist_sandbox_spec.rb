require_relative "../spec_helper.rb"

describe "RungistSandbox" do
  describe ".run" do

    it "returns number 2" do
      RungistSandbox.run('1 + 1').should eq(2)
    end

    it "raises the timeout exception" do
      expect {
        RungistSandbox.run('loop {}')
      }.to raise_error(Sandbox::TimeoutError)
    end

    it "raises the sandbox exception" do
      expect {
        RungistSandbox.run("require 'securerandom'")
      }.to raise_error(Sandbox::SandboxException)
    end

    it "stubs file system" do
      RungistSandbox.run("Dir.glob('/*')").should be_empty
    end

    it "renders ERB template" do
      actual = "<div id='gist' class=\"gist\"><%= 1 + 1 %></div>"
      expected = "<div id='gist' class=\"gist\">2</div>"
      RungistSandbox.run(actual, :language => 'HTML+ERB').should eq(expected)
    end

    it "raises the language not supported exception" do
      expect {
        RungistSandbox.run("1 + 1", :language => 'JavaScript')
      }.to raise_error(RungistSandbox::LanguageNotSupportedError)
    end

  end
end
