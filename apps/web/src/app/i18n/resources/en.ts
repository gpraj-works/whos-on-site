export const en = {
  translation: {
    app: {
      name: 'WhosOnSite',
      tagline: "See who's on the job — live."
    },
    auth: {
      signIn: 'Sign in',
      register: {
        title: 'Create your company account',
        subtitle: 'Start dispatching in minutes. No credit card required.',
        companyName: 'Company Name',
        companyNamePlaceholder: 'e.g. Acme HVAC Services',
        email: 'Work Email',
        emailPlaceholder: 'you@yourcompany.com',
        password: 'Password',
        submit: 'Create Account',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in'
      }
    },
    nav: {
      dashboard: 'Dashboard',
      dispatch: 'Jobs',
      jobs: 'Jobs',
      agents: 'Agents',
      customers: 'Customers',
      analytics: 'Analytics',
      settings: 'Settings'
    },
    theme: {
      title: 'Appearance',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      colorScheme: 'Color Scheme',
      primaryColor: 'Company Accent Color',
      swatchLabel: 'Select brand swatch'
    },
    language: {
      selectLanguage: 'Language',
      english: 'English',
      tamil: 'தமிழ் (Tamil)'
    },
    status: {
      unassigned: 'Unassigned',
      assigned: 'Assigned',
      en_route: 'En Route',
      on_site: 'On Site',
      complete: 'Completed',
      cancelled: 'Cancelled',
      available: 'Available',
      busy: 'Busy',
      offline: 'Offline'
    },
    common: {
      actions: 'Actions',
      add: 'Add',
      update: 'Update',
      new: 'New',
      save: 'Save Changes',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search...',
      filter: 'Filter',
      refresh: 'Refresh',
      loading: 'Loading data...',
      noData: 'No records found',
      error: 'An unexpected error occurred'
    },
    dashboard: {
      title: 'Dashboard',
      myDashboardTitle: 'My Dashboard',
      managementSubtitle: 'Company-wide dispatch and field operations overview',
      agentSubtitle: 'Your job schedule and performance at a glance',
      activeJobs: 'Active Jobs',
      agentsOnline: 'Agents Online',
      completedToday: 'Completed Jobs',
      totalAgents: 'Total Agents',
      unassignedJobs: 'Unassigned Jobs',
      enRoute: 'En Route',
      onSite: 'On Site',
      assignedWaiting: 'Assigned',
      totalJobs: 'Total Jobs',
      enRouteField: 'en route',
      onSiteField: 'on site',
      unassignedField: 'unassigned',
      availableField: 'available',
      busyField: 'busy',
      totalJobsField: 'total jobs recorded',
      awaitingDispatch: 'awaiting dispatch',
      enRouteDesc: 'agents traveling to job',
      onSiteDesc: 'agents currently at job',
      assignedDesc: 'dispatched, not yet traveling',
      totalJobsDesc: 'all jobs recorded',
      recentJobs: 'Recent Jobs',
      recentJobsSubtitle: 'Active jobs and field tracking',
      noJobsMessage: 'No jobs created yet.',
      viewAllJobs: 'View All Jobs',
      dispatchCompletion: 'Dispatch Completion',
      jobsShort: 'Jobs',
      dispatchProgressLabel: 'Live metrics for company operations',
      fieldAgents: 'Field Agents',
      viewAllAgents: 'View All',
      noAgentsMessage: 'No agents available.',
      noPhone: 'No phone',
      myJobsToday: 'My Jobs Today',
      myJobsTodayDesc: '{{count}} active today',
      nextAppointment: 'Next Appointment',
      noneScheduled: 'No upcoming appointments',
      completionRate: 'Completion Rate',
      completedOf: 'of',
      jobsCompleted: 'jobs completed',
      todaySchedule: "Today's Schedule",
      todayScheduleSubtitle: 'Assigned jobs scheduled for today',
      noTodayJobs: 'No jobs scheduled for today.'
    },
    jobs: {
      title: 'Jobs',
      subtitle: 'Manage job assignments, status, and tracking',
      newJob: 'New',
      createTitle: 'New Job',
      jobId: 'Job ID',
      customer: 'Customer',
      customerAddress: 'Customer & Address',
      selectCustomer: 'Select a customer',
      addCustomer: 'New Customer',
      createCustomerTitle: 'New Customer',
      customerName: 'Customer Name',
      customerMobile: 'Phone Number',
      customerAddressField: 'Address',
      customerEmail: 'Email (Optional)',
      saveCustomer: 'Add',
      scheduledAt: 'Schedule',
      scheduledFor: 'Scheduled For',
      createdAt: 'Created',
      notes: 'Description',
      notesPlaceholder: 'Enter job service details or instructions',
      createSubmit: 'Add',
      assignTitle: 'Assign Agent',
      selectAgent: 'Select Field Agent',
      chooseAgent: 'Choose an available agent',
      assignConfirm: 'Update',
      unassignButton: 'Unassign Current Agent',
      noCustomer: 'Unassigned Customer',
      status: 'Status',
      agent: 'Agent',
      assignAgent: 'Assign Agent',
      reassignAgent: 'Reassign Agent',
      markEnRoute: 'Start En Route',
      markOnSite: 'Arrive On Site',
      markComplete: 'Complete Job',
      cancelJob: 'Cancel Job',
      cancelTitle: 'Cancel Job',
      cancelConfirmMessage:
        'Are you sure you want to cancel this job? This will update status to Cancelled.',
      terminalStateNotice: 'This job is in a terminal state.',
      availableActions: 'Available Status Actions',
      addStatusNote: 'Add optional note for status change:',
      notePlaceholder: 'e.g. Delayed due to traffic',
      statusHistory: 'Status Audit Trail',
      noHistory: 'No status changes recorded yet.',
      filterAll: 'All Statuses',
      copyShareLink: 'Copy Share Link',
      linkCopied: 'Public share link copied to clipboard'
    },
    customerStatus: {
      title: 'Job Status Page',
      subtitle: 'Real-time status tracking for customer jobs',
      customer: 'Customer',
      agent: 'Assigned Agent',
      unassignedTech: 'Awaiting agent assignment',
      scheduledAt: 'Scheduled Time',
      lastUpdated: 'Last Updated',
      timeline: 'Service Progress',
      historyTitle: 'Status History',
      autoRefresh: 'Auto-refreshing live status (30s)',
      notFoundTitle: 'Status Link Expired or Not Found',
      notFoundSubtitle: 'This public customer share link may have expired or is invalid.'
    },
    agents: {
      title: 'Agents',
      subtitle: 'Real-time agent availability, status tracking, and location readiness',
      createTitle: 'New Agent',
      name: 'Agent',
      status: 'Status',
      phone: 'Phone Number',
      location: 'Last Known Location',
      lastUpdated: 'Last Updated'
    },
    customers: {
      title: 'Customers',
      subtitle: 'Manage company customer accounts and service locations',
      addCustomer: 'New',
      createTitle: 'New Customer',
      name: 'Customer Name',
      phone: 'Phone Number',
      address: 'Address',
      email: 'Email',
      createdAt: 'Created At',
      saveSubmit: 'Add',
      pickOnMap: 'Pick on map',
      hideMap: 'Hide map',
      searchAddress: 'Searching addresses...',
      addressHint: 'Type to search or pick a location on the map',
      locationSet: 'Location pinned'
    },
    landing: {
      nav: {
        features: 'Features',
        howItWorks: 'How it works',
        about: 'About',
        pricing: 'Pricing',
        signIn: 'Sign in',
        startTrial: 'Start free trial'
      },
      hero: {
        badge: 'Real-time field-service dispatch',
        title: 'See who is on the job — live',
        subtitle:
          'WhosOnSite replaces phone-and-text dispatch with a live board that shows every job, every agent, and every status change in real time.',
        primaryCta: 'Start free trial',
        secondaryCta: 'Sign in',
        liveBoard: 'Live Dispatch Board',
        jobCardTitle: 'Kitchen faucet repair',
        jobCardTitle2: 'AC filter replacement',
        jobCardEta: 'Arriving in 12 min',
        agentCardLabel: 'Field Agents'
      },
      features: {
        title: 'Everything your dispatch used to do over the phone',
        subtitle:
          'One live board replaces the group chats, the "where are they" calls, and the manual check-ins.',
        items: {
          liveBoard: {
            title: 'Live dispatch board',
            desc: 'Every job and every agent on one screen, updating in real time.'
          },
          oneTap: {
            title: 'One-tap status updates',
            desc: 'Agents tap en route, on site, or complete from their phone — no calls back to the office.'
          },
          nearby: {
            title: 'Nearby agent matching',
            desc: 'PostGIS-powered proximity search finds the nearest available agent to assign in seconds.'
          },
          customerPage: {
            title: 'Customer status pages',
            desc: 'Share a live link so customers can see exactly where their work is — without calling in.'
          },
          auditTrail: {
            title: 'Immutable audit trail',
            desc: 'Every status change is timestamped and recorded, so disputes have a paper trail.'
          },
          reassign: {
            title: 'Instant reassignment',
            desc: 'Illness or overtime? Reassign mid-day in two clicks without calling everyone.'
          }
        }
      },
      how: {
        title: 'How it works',
        subtitle: 'From phone tag to live dispatch in three steps.',
        stepLabel: 'Step',
        steps: {
          create: {
            title: 'Create the job',
            desc: 'Add the customer and address, and schedule the work.'
          },
          assign: {
            title: 'Assign the nearest agent',
            desc: 'See who is free and closest, then assign with one click.'
          },
          track: {
            title: 'Track it live',
            desc: 'Watch the job move to en route, on site, and complete in real time.'
          }
        }
      },
      about: {
        title: 'Built for field-service teams still running on calls and group texts',
        subtitle:
          'WhosOnSite is a multi-tenant dispatch platform for teams of 10–50 field workers who need more visibility than a phone can give.',
        body: 'Field-service businesses coordinate their whole day through phone calls and text messages — but nobody knows who is free, who is nearby, or where a job stands until someone calls to ask. WhosOnSite puts every job and every agent on a live, permissioned board, so the entire day runs on visibility instead of phone tag.',
        verticalsTitle: 'Built for verticals like',
        verticals: ['HVAC', 'Plumbing', 'Electrical', 'Cleaning', 'Courier', 'Inspections']
      },
      plans: {
        title: 'Simple plans that scale with your crew',
        subtitle: 'Straightforward per-agent pricing for the whole operation. Billing is coming soon.',
        perAgent: 'per agent / month',
        startTrial: 'Start free trial',
        popular: 'Most popular',
        tiers: {
          starter: {
            name: 'Starter',
            price: '$19',
            desc: 'For small teams just moving off phone dispatch.',
            features: [
              'Live dispatch board',
              'Up to 10 field agents',
              'Job status tracking',
              'Customer status pages'
            ]
          },
          growth: {
            name: 'Growth',
            price: '$29',
            desc: 'For growing teams that need the full playbook.',
            features: [
              'Everything in Starter',
              'Nearby agent matching',
              'Full audit trail',
              'Priority support'
            ]
          },
          enterprise: {
            name: 'Enterprise',
            price: 'Custom',
            desc: 'For multi-site operations with advanced needs.',
            features: [
              'Everything in Growth',
              'Unlimited agents',
              'SSO & advanced security',
              'Dedicated onboarding'
            ]
          }
        }
      },
      cta: {
        title: 'Ready to see who is on the job — live?',
        subtitle: 'Create your account and get your whole crew on the board in minutes.',
        primaryCta: 'Start free trial',
        secondaryCta: 'Sign in'
      },
      footer: {
        tagline: 'Live, permissioned dispatch for field-service teams.',
        product: 'Product',
        getStarted: 'Get Started',
        rights: 'All rights reserved.',
        madeFor: 'Made for field-service teams.',
        links: {
          signIn: 'Sign in',
          register: 'Start free trial'
        }
      }
    }
  }
}
