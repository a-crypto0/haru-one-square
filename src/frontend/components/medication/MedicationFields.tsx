import { Image, StyleSheet, Text, TextInput, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, touchSize, typography } from '../../theme/tokens'
import type { UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface MedicationFieldsProps {
  photoUri?: string
  displayName: string
  isEditingExisting: boolean
  showDetails?: boolean
  safetyConfirmed: boolean
  onDisplayNameChange: (value: string) => void
  onPhotoChange: (uri?: string) => void
  onConfirmSafety: (confirmed: boolean) => void
  state?: UiState
}

export function MedicationFields({ photoUri, displayName, isEditingExisting, showDetails = true, safetyConfirmed, onDisplayNameChange, onPhotoChange, onConfirmSafety, state = 'success' }: MedicationFieldsProps) {
  const { colors, mode } = useFrontendTheme()
  if (state !== 'success') return <StateMessage state={state} loadingText={copy.medication.loading} errorText={copy.medication.error} emptyText={copy.medication.empty} />
  return (
    <View style={styles.wrapper}>
      <Text style={[typography.section, { color: colors.text }]}>{copy.task.medicationKind}</Text>
      {showDetails ? <>{photoUri ? <Image accessibilityLabel={copy.medication.photoAlt} source={{ uri: photoUri }} style={styles.image} /> : <StateMessage state="empty" emptyText={copy.medication.empty} />}
      <View style={styles.row}>
        <ActionButton label={photoUri ? copy.medication.changePhoto : copy.medication.addPhoto} onPress={() => onPhotoChange('medication-photo.jpg')} tone="secondary" />
        {photoUri ? <ActionButton label={copy.medication.removePhoto} onPress={() => onPhotoChange(undefined)} /> : null}
      </View>
      <Text style={[bodyType(mode), { color: colors.text }]}>{copy.medication.displayName}</Text>
      <TextInput
        accessibilityLabel={copy.medication.displayName}
        onChangeText={onDisplayNameChange}
        style={[bodyType(mode), styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        value={displayName}
      /></> : null}
      <View style={[styles.notice, { backgroundColor: colors.warningSoft, borderColor: colors.warning }]}>
        <Text style={[bodyType(mode), { color: colors.warning }]}>{copy.medication.safety}</Text>
        <ActionButton label={`${safetyConfirmed ? '✓ ' : ''}${copy.medication.confirm}`} onPress={() => onConfirmSafety(!safetyConfirmed)} selected={safetyConfirmed} />
      </View>
      {isEditingExisting ? <Text style={[bodyType(mode), { color: colors.info }]}>{copy.medication.supporterNotice}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  image: { borderRadius: radii.input, height: 88, width: 88 },
  input: { borderRadius: radii.input, borderWidth: 1, minHeight: touchSize, paddingHorizontal: spacing.md },
  notice: { borderRadius: radii.input, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  wrapper: { gap: spacing.md },
})
