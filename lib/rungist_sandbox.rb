require 'sandbox'

# Add required methods for ERB module
SANDBOX_STRING_METHODS = (Sandbox::Safe::STRING_METHODS + ['encoding', 'force_encoding']).freeze
Sandbox::Safe.const_set('STRING_METHODS', SANDBOX_STRING_METHODS)

class RungistSandbox

  def self.eval(code, opts = {})
    sandbox = new(code, opts)
    sandbox.eval
  end

  def initialize(code, opts)
    @code = code
    @language = opts[:language]
  end

  def eval
    sandbox = new_sandbox
    sandbox.activate!
    result = sandbox.eval(@code, :timeout => 1)
  end

  private

  def new_sandbox
    sandbox = Sandbox.safe

    if @language == 'HTML+ERB'
      sandbox.require 'erb'
      @code = "ERB.new(#{@code.inspect}).result"
    end

    sandbox
  end

end
