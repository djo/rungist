require 'sandbox'

# Add required methods for ERB module
SANDBOX_STRING_METHODS = (Sandbox::Safe::STRING_METHODS + ['encoding', 'force_encoding']).freeze
Sandbox::Safe.const_set('STRING_METHODS', SANDBOX_STRING_METHODS)

class RungistSandbox
  class LanguageNotSupportedError < RuntimeError; end

  SUPPORTED_LANGUAGES = ['Ruby', 'HTML+ERB']

  def self.run(code, opts = {})
    sandbox = new(code, opts)
    sandbox.prepare
    sandbox.eval
  end

  def initialize(code, opts)
    @code = code
    @language = opts[:language] || 'Ruby'
    @sandbox = Sandbox.safe
  end

  def prepare
    raise LanguageNotSupportedError unless SUPPORTED_LANGUAGES.include?(@language)

    if @language == 'HTML+ERB'
      @sandbox.require 'erb'
      @code = "ERB.new(#{@code.inspect}).result"
    end
  end

  def eval
    @sandbox.activate!
    @sandbox.eval(@code, :timeout => 0.5)
  end

end
