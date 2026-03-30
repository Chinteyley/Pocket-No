Pod::Spec.new do |s|
  s.name             = 'KeyboardDismiss'
  s.version          = '1.0.0'
  s.summary          = 'Pocket-No keyboard translation helper.'
  s.description      = 'Local Expo module that offsets the iOS keyboard window during composer dismissal.'
  s.homepage         = 'https://github.com/expo/expo'
  s.license          = { type: 'MIT' }
  s.author           = { 'Pocket-No' => 'dev@ctey.dev' }
  s.platforms        = { :ios => '15.1' }
  s.source           = { git: '' }
  s.static_framework = true
  s.swift_version    = '5.9'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'
end
