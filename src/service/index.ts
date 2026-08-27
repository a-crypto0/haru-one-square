import type { AppServices } from './contracts'
import { authService } from './authService'
import { medicationService } from './medicationService'
import { notificationService } from './notificationService'
import { preferenceService } from './preferenceService'
import { recordService } from './recordService'
import { sharingService } from './sharingService'
import { speechService } from './speechService'
import { taskService } from './taskService'
import { weightService } from './weightService'

export const appServices: AppServices = {
  auth: authService,
  tasks: taskService,
  records: recordService,
  weights: weightService,
  medications: medicationService,
  sharing: sharingService,
  notifications: notificationService,
  speech: speechService,
  preferences: preferenceService,
}
