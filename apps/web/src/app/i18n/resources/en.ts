export const en = {
  translation: {
    app: {
      name: 'WhosOnSite',
      tagline: "See who's on the job — live."
    },
    nav: {
      dashboard: 'Dashboard',
      jobs: 'Dispatch',
      technicians: 'Technicians',
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
      complete: 'Complete',
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
      activeJobs: 'Active Jobs',
      techniciansOnline: 'Technicians Online',
      completedToday: 'Completed Dispatches',
      totalTechnicians: 'Total Staff'
    },
    jobs: {
      title: 'Dispatch Board',
      subtitle: 'Manage job assignments, status state machine, and customer dispatches',
      newJob: 'New',
      createTitle: 'Create Dispatch Job',
      jobId: 'Job ID',
      customer: 'Customer',
      customerAddress: 'Customer & Address',
      selectCustomer: 'Select a customer',
      addCustomer: 'New Customer',
      createCustomerTitle: 'Create New Customer',
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
      assignTitle: 'Assign Technician',
      selectTechnician: 'Select Field Technician',
      chooseTechnician: 'Choose an available technician',
      assignConfirm: 'Update',
      unassignButton: 'Unassign Current Technician',
      noCustomer: 'Unassigned Customer',
      status: 'Status',
      technician: 'Technician',
      assignTechnician: 'Assign Technician',
      reassignTechnician: 'Reassign Tech',
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
      subtitle: 'Real-time status tracking for customer dispatches',
      customer: 'Customer',
      technician: 'Assigned Technician',
      unassignedTech: 'Awaiting technician assignment',
      scheduledAt: 'Scheduled Time',
      lastUpdated: 'Last Updated',
      timeline: 'Service Progress',
      historyTitle: 'Status History',
      autoRefresh: 'Auto-refreshing live status (30s)',
      notFoundTitle: 'Status Link Expired or Not Found',
      notFoundSubtitle: 'This public customer share link may have expired or is invalid.'
    },
    technicians: {
      title: 'Field Technicians',
      subtitle:
        'Real-time technician availability, status tracking, and location dispatch readiness',
      name: 'Technician',
      status: 'Status',
      phone: 'Phone Number',
      location: 'Last Known Location',
      lastUpdated: 'Last Updated'
    },
    customers: {
      title: 'Customers',
      subtitle: 'Manage company customer accounts and service locations',
      addCustomer: 'New',
      createTitle: 'Add New Customer',
      name: 'Customer Name',
      phone: 'Phone Number',
      address: 'Address',
      email: 'Email',
      createdAt: 'Created At',
      saveSubmit: 'Add'
    }
  }
}
