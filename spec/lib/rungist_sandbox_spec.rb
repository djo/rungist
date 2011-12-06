require_relative "../spec_helper.rb"

describe "RungistSandbox" do
  describe ".eval" do

    it "returns number 2" do
      RungistSandbox.eval('1 + 1').should eq(2)
    end

    it "raises a timeout exception" do
      expect {
        RungistSandbox.eval('loop {}')
      }.to raise_error(Sandbox::TimeoutError)
    end

    it "raises a sandbox exception" do
      expect {
        RungistSandbox.eval("require 'securerandom'")
      }.to raise_error(Sandbox::SandboxException)
    end

    it "stubs file system" do
      RungistSandbox.eval("Dir.glob('/*')").should be_empty
    end

  end
end
