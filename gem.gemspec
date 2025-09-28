require_relative 'lib/maplibre-preview/version'

Gem::Specification.new do |s|
  s.name        = 'maplibre-preview'
  s.version     = MapLibrePreview::VERSION
  # s.executables << 'ssbase'
  s.summary     = 'Common files'
  s.authors     = ['Artyom B']
  s.bindir        = 'bin'
  s.require_paths = ['lib']
  s.files = Dir.glob('{bin,lib,test,examples}/**/*', File::FNM_DOTMATCH).reject {File.directory?(_1) }
  s.require_paths = ['lib']
  s.required_ruby_version = ">= " + File.read(File.dirname(__FILE__)+'/.ruby-version').strip

  s.add_dependency 'rack'
  # s.add_dependency 'sinatra'

  s.add_development_dependency "rake", "~> 13.0"
  s.add_development_dependency "rspec", "~> 3.10"
  s.add_development_dependency "rubocop", "~> 1.63.2"
  s.add_development_dependency "rubocop-rake", "~> 0.6.0"
  s.add_development_dependency "rubocop-rspec", "~> 2.14.2"
  s.add_development_dependency "rspec_junit_formatter", "~> 0.5.1"

end

