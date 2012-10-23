require_relative "../spec_helper.rb"

describe RungistSandbox do
  describe "#eval" do
    it "adds two numbers" do
      sandbox('1 + 1').should eq(2)
    end

    it "renders an ERB template" do
      actual = "<div id='gist' class=\"gist\"><%= 1 + 1 %></div>"
      expected = "<div id='gist' class=\"gist\">2</div>"

      sandbox(actual, 'HTML+ERB').should eq(expected)
    end

    it "works with a stubbed file system" do
      sandbox("Dir.glob('/*')").should be_empty
    end

    it "raises the exception when the language is not supported" do
      expect {
        sandbox('1 + 1', 'JavaScript')
      }.to raise_error(RungistSandbox::LanguageNotSupportedError)
    end

    it "raises the exception in the timeout case" do
      expect {
        sandbox('loop {}')
      }.to raise_error(Sandbox::TimeoutError)
    end

    it "raises the exception in a sandbox internal error" do
      expect {
        sandbox("require 'securerandom'")
      }.to raise_error(Sandbox::SandboxException)
    end
  end

  def sandbox(code, language = 'Ruby')
    RungistSandbox.new(code, language).eval
  end
end
