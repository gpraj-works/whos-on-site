import { describe, expect, it } from 'vitest'
import { JobStatus } from '@whosonsite/shared'
import { canTransition } from '../../src/modules/jobs/job.state-machine'

describe('Job State Machine Unit Tests', () => {
  describe('Legal Transitions', () => {
    it('allows UNASSIGNED -> ASSIGNED', () => {
      expect(canTransition(JobStatus.UNASSIGNED, JobStatus.ASSIGNED)).toBe(true)
    })

    it('allows UNASSIGNED -> CANCELLED', () => {
      expect(canTransition(JobStatus.UNASSIGNED, JobStatus.CANCELLED)).toBe(true)
    })

    it('allows ASSIGNED -> EN_ROUTE', () => {
      expect(canTransition(JobStatus.ASSIGNED, JobStatus.EN_ROUTE)).toBe(true)
    })

    it('allows ASSIGNED -> UNASSIGNED (un-assignment/reassignment)', () => {
      expect(canTransition(JobStatus.ASSIGNED, JobStatus.UNASSIGNED)).toBe(true)
    })

    it('allows ASSIGNED -> CANCELLED', () => {
      expect(canTransition(JobStatus.ASSIGNED, JobStatus.CANCELLED)).toBe(true)
    })

    it('allows EN_ROUTE -> ON_SITE', () => {
      expect(canTransition(JobStatus.EN_ROUTE, JobStatus.ON_SITE)).toBe(true)
    })

    it('allows EN_ROUTE -> CANCELLED', () => {
      expect(canTransition(JobStatus.EN_ROUTE, JobStatus.CANCELLED)).toBe(true)
    })

    it('allows ON_SITE -> COMPLETE', () => {
      expect(canTransition(JobStatus.ON_SITE, JobStatus.COMPLETE)).toBe(true)
    })

    it('allows ON_SITE -> CANCELLED', () => {
      expect(canTransition(JobStatus.ON_SITE, JobStatus.CANCELLED)).toBe(true)
    })
  })

  describe('Illegal & Terminal Transitions', () => {
    it('disallows transition to the same status', () => {
      expect(canTransition(JobStatus.UNASSIGNED, JobStatus.UNASSIGNED)).toBe(false)
      expect(canTransition(JobStatus.EN_ROUTE, JobStatus.EN_ROUTE)).toBe(false)
    })

    it('disallows skipping states e.g. UNASSIGNED -> COMPLETE', () => {
      expect(canTransition(JobStatus.UNASSIGNED, JobStatus.COMPLETE)).toBe(false)
      expect(canTransition(JobStatus.UNASSIGNED, JobStatus.ON_SITE)).toBe(false)
    })

    it('disallows backward transitions e.g. ON_SITE -> EN_ROUTE', () => {
      expect(canTransition(JobStatus.ON_SITE, JobStatus.EN_ROUTE)).toBe(false)
      expect(canTransition(JobStatus.COMPLETE, JobStatus.ON_SITE)).toBe(false)
    })

    it('treats COMPLETE as a terminal state (no transitions out allowed)', () => {
      expect(canTransition(JobStatus.COMPLETE, JobStatus.UNASSIGNED)).toBe(false)
      expect(canTransition(JobStatus.COMPLETE, JobStatus.ASSIGNED)).toBe(false)
      expect(canTransition(JobStatus.COMPLETE, JobStatus.CANCELLED)).toBe(false)
    })

    it('treats CANCELLED as a terminal state (no transitions out allowed)', () => {
      expect(canTransition(JobStatus.CANCELLED, JobStatus.UNASSIGNED)).toBe(false)
      expect(canTransition(JobStatus.CANCELLED, JobStatus.ASSIGNED)).toBe(false)
      expect(canTransition(JobStatus.CANCELLED, JobStatus.COMPLETE)).toBe(false)
    })
  })
})
