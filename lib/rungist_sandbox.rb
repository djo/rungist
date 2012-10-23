require 'sandbox'

# Add required methods for ERB module
SANDBOX_STRING_METHODS = (Sandbox::Safe::STRING_METHODS + ['encoding', 'force_encoding']).freeze
Sandbox::Safe.const_set('STRING_METHODS', SANDBOX_STRING_METHODS)

class RungistSandbox
  class LanguageNotSupportedError < RuntimeError; end

  SUPPORTED_LANGUAGES = ['Ruby', 'HTML+ERB']

  def initialize(code, language = nil)
    @code = code
    @language = language || 'Ruby'
    raise LanguageNotSupportedError unless SUPPORTED_LANGUAGES.include?(@language)
  end

  def eval
    sandbox = Sandbox.safe

    if @language == 'HTML+ERB'
      sandbox.require 'erb'
      @code = "ERB.new(#{@code.inspect}).result"
    end

    sandbox.activate!
    sandbox.eval(@code, :timeout => 0.5)
  end
end
