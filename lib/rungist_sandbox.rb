require 'sandbox'

class RungistSandbox

  def self.eval(code)
    sandbox = new(code)
    sandbox.eval
  end

  def initialize(code)
    @code = code
  end

  def eval
    sandbox = Sandbox.safe
    sandbox.activate!
    result = sandbox.eval(@code, :timeout => 1)
  end

end
