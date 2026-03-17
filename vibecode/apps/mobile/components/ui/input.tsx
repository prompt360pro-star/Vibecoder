// Input — Com suporte a erro, password toggle e ícone
import { useState, type ReactNode } from 'react'
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  type KeyboardTypeOptions,
} from 'react-native'

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  icon?: ReactNode
  error?: string
  multiline?: boolean
  maxLength?: number
  style?: StyleProp<ViewStyle>
  keyboardType?: KeyboardTypeOptions
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  label?: string
}

export default function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  icon,
  error,
  multiline = false,
  maxLength,
  style,
  keyboardType,
  autoCapitalize,
  label,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrap,
          multiline && styles.multiline,
          isFocused && styles.focused,
          error ? styles.error : undefined,
        ]}
      >
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}

        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            icon ? styles.inputWithIcon : undefined,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#555555"
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>⚠ {error}</Text>
      ) : null}

      {maxLength ? (
        <Text style={styles.counter}>
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    height: 48,
  },
  multiline: {
    height: 100,
    alignItems: 'flex-start',
  },
  focused: {
    borderColor: '#8B5CF6',
  },
  error: {
    borderColor: '#EF4444',
  },
  iconWrap: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  multilineInput: {
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  eyeButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '100%',
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  counter: {
    color: '#666666',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
})
