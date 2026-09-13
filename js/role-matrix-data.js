/* Role × workflow-area matrix, read by js/role-matrix.js.

   A cell exists ONLY where that role's own overview names something in that
   area, and its value is the fragment it came from. Do not fill a cell by
   inference from a role's name: the component's point is that every role has
   at least one empty area, and an inferred cell can silently break that. */

window.ROLE_MATRIX = (function () {

  var LANES = [
    { id: 'onboarding',  label: 'Onboarding' },
    { id: 'nomination',  label: 'Nomination' },
    { id: 'contracting', label: 'Contracting' },
    { id: 'program',     label: 'Program request' },
    { id: 'budgeting',   label: 'Budgeting' },
    { id: 'inquiry',     label: 'Inquiry' },
    { id: 'registration',label: 'Registration' },
    { id: 'reporting',   label: 'Reporting' },
    { id: 'library',     label: 'Speaker & library' },
    { id: 'expense',     label: 'Expense' },
    { id: 'payment',     label: 'Billing & payment' },
    { id: 'recon',       label: 'Reconciliation' },
    { id: 'shared',      label: 'Shared features' }
  ];

  var SHARED = 'Common requirements applicable for all users of the platform.';

  /* What each group of roles is FOR, in a sentence. The bare group word on its
     own ("Propose") tells a reader nothing. */
  var GROUPS = {
    'Propose':   'Proposes the program: nominates the doctor, raises the request, hosts it on the day.',
    'Approval':  'Approves the program: signs off the speaker, the spend and the contract.',
    'Operation': 'Runs the program: books the event, then settles what it cost.',
    'Oversight': 'Watches the program: reads the record, changes nothing.',
    'Attendant': 'Shows up to the program: presents, or registers and signs in.'
  };

  var ROLES = [
    {
      id: 'rookie', name: 'Rookie', group: 'Propose',
      line: 'One thing: finish the playbook. Until that is done, nothing else on the platform is theirs.',
      cells: {
        onboarding: 'Required to launch playbook to become a fully functioned Representative.',
        shared: SHARED
      }
    },
    {
      id: 'representative', name: 'Representative', group: 'Propose',
      line: 'Starts the program and names the speaker, then runs the room on the day. Cannot contract, cannot spend, cannot settle.',
      cells: {
        nomination: 'Nominate speakers.',
        program: 'Initiate programs; view program details.',
        budgeting: 'View budget.',
        registration: 'Checking people into the event and gathering the contact information and signatures of pre registered attendees and walk in attendees.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'msl', name: 'Medical Science Liaison', group: 'Propose',
      line: 'Names a speaker and reads the calendar. That is the whole permission.',
      cells: {
        nomination: 'Nominate speakers.',
        program: 'View program calendar.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'division', name: 'Division Manager', group: 'Approval',
      line: 'Everything the representative can do, plus the approval on it. Still nothing past the approval — no contract, no money.',
      cells: {
        nomination: 'Nominate and approve speakers.',
        program: 'Initiate and approve programs; view program details.',
        budgeting: 'View budget.',
        registration: 'View attendees.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'region', name: 'Region Manager', group: 'Approval',
      line: 'Approves what the division does and reads it back on the dashboard. Stops at the same wall: no contract, no expense, no payment.',
      cells: {
        nomination: 'Nominate and approve speakers.',
        program: 'Initiate and approve programs; view program details.',
        budgeting: 'View budget.',
        registration: 'View attendees.',
        reporting: 'View global dashboard.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'brand', name: 'Brand Manager', group: 'Approval',
      line: 'Reaches furthest of anyone — nominate, contract, approve, fund, report. Then stops dead at expense, payment and reconciliation.',
      cells: {
        nomination: 'Nominate and approve speakers.',
        contracting: 'Counter sign contract.',
        program: 'Initiate and approve programs; view program details.',
        budgeting: 'Manage brand budgets.',
        inquiry: 'Approve inquiry.',
        registration: 'View attendees.',
        reporting: 'View global dashboard.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'homeoffice', name: 'Home Office', group: 'Approval',
      line: 'Reaches furthest of anyone — nominate, contract, approve, fund, report. Then stops dead at expense, payment and reconciliation.',
      cells: {
        nomination: 'Nominate and approve speakers.',
        contracting: 'Counter sign contract.',
        program: 'Initiate and approve programs; view program details.',
        budgeting: 'Manage brand budgets.',
        inquiry: 'Approve inquiry.',
        registration: 'View attendees.',
        reporting: 'Generate national-level reports; view global dashboard.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'coordinator', name: 'Coordinator', group: 'Operation',
      line: 'Runs the event end to end and pays for it. Never gets to start one, name a speaker, or sign anything.',
      cells: {
        program: 'View program details.',
        budgeting: 'View budget.',
        inquiry: 'Submit inquiries.',
        registration: 'Generate QR code, send invitation; view attendees.',
        reporting: 'View global dashboard.',
        library: 'View speaker roster and library.',
        expense: 'Submit or review expenses.',
        payment: 'View payment.',
        shared: SHARED
      }
    },
    {
      id: 'bureau', name: 'Bureau Manager', group: 'Operation',
      line: 'The approval half of the coordinator job. Same wall at the front of the program.',
      cells: {
        program: 'View program details.',
        budgeting: 'View budget.',
        inquiry: 'Approve inquiries.',
        registration: 'View attendees.',
        reporting: 'View global dashboard.',
        library: 'View speaker roster and library.',
        expense: 'Review expenses.',
        payment: 'View payment.',
        shared: SHARED
      }
    },
    {
      id: 'project', name: 'Project Team', group: 'Operation',
      line: 'Bureau Manager permissions, pointed at non-speaker programs. Same front-end wall.',
      cells: {
        program: 'View program details.',
        budgeting: 'View budget.',
        inquiry: 'Approve inquiries.',
        registration: 'View attendees.',
        reporting: 'View global dashboard.',
        library: 'View speaker roster and library.',
        expense: 'Review expenses.',
        payment: 'View payment.',
        shared: SHARED
      }
    },
    {
      id: 'administrator', name: 'Administrator', group: 'Operation',
      line: 'The document says it plainly — similar to Bureau Manager. Same set, same wall.',
      cells: {
        program: 'View program details.',
        budgeting: 'View budget.',
        inquiry: 'Approve inquiries.',
        registration: 'View attendees.',
        reporting: 'View global dashboard.',
        library: 'View speaker roster and library.',
        expense: 'Review expenses.',
        payment: 'View payment.',
        shared: SHARED
      }
    },
    {
      id: 'superadmin', name: 'Super Admin', group: 'Operation',
      line: 'Its overview is the Administrator overview, copied. The document never says what a Super Admin can do that an Administrator cannot.',
      cells: {
        program: 'View program details.',
        budgeting: 'View budget.',
        inquiry: 'Approve inquiries.',
        registration: 'View attendees.',
        reporting: 'View global dashboard.',
        library: 'View speaker roster and library.',
        expense: 'Review expenses.',
        payment: 'View payment.',
        shared: SHARED
      }
    },
    {
      id: 'accounting', name: 'Accounting Team', group: 'Operation',
      line: 'The only role that reaches reconciliation. Blind to nomination, contracting and the speaker library.',
      cells: {
        program: 'Program status; program inception date, to identify aging programs.',
        budgeting: 'Support monthly budget and accrual reporting for client meetings.',
        registration: 'Checklist status and sign-in sheet verification.',
        reporting: 'Oversees key financial reports and operations, including the global report, the check request report and the Sunshine report.',
        expense: 'Cross-references daily expense reports from [the corporate card platform] with cost items uploaded to the platform.',
        payment: 'Responsible for billing, revenue recognition, and financial reporting. Only members of the Accounting Team have permission to view or edit credit card information in the platform.',
        recon: 'Validating documentation and reconciling expenses between the platform, [the corporate card platform] and [the accounting software].',
        shared: SHARED
      }
    },
    {
      id: 'compliance', name: 'Compliance', group: 'Oversight',
      line: 'Reads the calendar and the roster. Cannot touch anything it is meant to check.',
      cells: {
        program: 'View program calendar.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'auditor', name: 'Auditor', group: 'Oversight',
      line: 'The same three cells as Compliance. Reads the calendar and the roster, and nothing else.',
      cells: {
        program: 'View program calendar.',
        library: 'View speaker roster and library.',
        shared: SHARED
      }
    },
    {
      id: 'speaker', name: 'Speaker', group: 'Attendant',
      line: 'Signs, presents, claims the fee. Never sees a budget, a nomination, or anyone else’s programs.',
      cells: {
        contracting: 'Sign contract.',
        program: 'View upcoming and past events; view program details.',
        library: 'Submit use cases and sort slides in a presentation; view library.',
        expense: 'Submit and review expense forms.',
        payment: 'Payment status for honoraria; view payment history.',
        shared: SHARED
      }
    },
    {
      id: 'attendee', name: 'Attendee', group: 'Attendant',
      line: 'Registers, turns up, signs in. Was not a role in the legacy portal at all.',
      cells: {
        program: 'View upcoming events.',
        registration: 'Register for an event, receive notifications and updates upon the event, sign in the event, and provide feedback of the event.',
        shared: SHARED
      }
    }
  ];

  /* Each role's "1. Overview" paragraph, close to verbatim. Client name,
     employee names and vendor names are removed or bracketed. Super Admin's
     is the Administrator text on purpose — the source copied it. */
  var OVERVIEWS = {
    rookie: 'Rookie is a type of Representative who is newly joining the Speakers Bureau Platform as a Sales Representative or MSL. In the legacy system, a Rookie has to launch the playbook to become a fully functioning Representative. In the new system, the playbook is folded into one onboarding process for Representatives, and can be switched on or off per client.',
    representative: 'Representative, also called Account Manager (AM), is usually a Sales Representative or Sales Agent. They nominate healthcare professionals (HCPs), propose events and attend sessions. Within the platform, the Representative is the host of a program and usually has the ability to initiate programs, nominate speakers, and view program details, attendees, speaker roster, budget and library. The Representative is also the accountable party: they check people into the event, gather attendee signatures, make sure the meal and drink rules are followed, and attest afterwards that every rule was followed.',
    msl: 'Medical Science Liaison (MSL), Thought Leader Liaison (TLL) and Field Manager (FM) are scientific roles that share updated science with HCPs, manage relationships with top doctors, support Representatives and ensure event quality. Within the platform, the Medical Science Liaison usually has the ability to nominate speakers, and view the program calendar, speaker roster and library.',
    division: 'Division Manager, also called District Manager (DM) or Area Sales Manager (ASM), oversees multiple Representatives within a division or district. They nominate and approve HCPs, propose and approve events, view budgets, and make sure Representative activity lines up with goals. Within the platform, the Division Manager usually has the ability to initiate and approve programs, nominate and approve speakers, and view program details, attendees, speaker roster, budget and library.',
    region: 'Region Manager (RM), sometimes called Area Sales Director (ASD), is a higher-level manager responsible for broader geographies, overseeing multiple Division Managers within a region. They manage budgets, review reports, and make sure Division Manager activity lines up with goals. Within the platform, the Region Manager usually has the ability to initiate and approve programs, nominate and approve speakers, and view the global dashboard, program details, attendees, speaker roster, budget and library.',
    brand: 'Brand Manager (BM) is a higher-level manager responsible for broader geographies, overseeing multiple Region Managers within a brand or therapeutic area. The role covers Commercial Operations (CO) and the Brand Team (BT). They manage budgets, review reports, and make sure Region Manager activity lines up with goals. Within the platform, the Brand Manager usually has the ability to counter-sign contracts, initiate and approve programs, nominate and approve speakers, manage brand budgets, approve inquiries, and view the global dashboard, program details, attendees, speaker roster, budget and library.',
    homeoffice: 'Home Office (HO) carries corporate oversight: it generates national-level reports, analyses spending trends and maintains platform integrity. Like the Brand Manager, it manages budgets, reviews reports, and makes sure Region Manager activity lines up with goals. Within the platform, Home Office usually has the ability to counter-sign contracts, initiate and approve programs, nominate and approve speakers, manage brand budgets, approve inquiries, and view the global dashboard, program details, attendees, speaker roster, budget and library.',
    coordinator: 'Coordinator handles event logistics: hotel booking, speaker travel, materials, venue setup and attendee reminders. Within the platform, the Coordinator usually has the ability to submit inquiries, generate QR codes, send invitations, submit or review expenses, and view the global dashboard, program details, attendees, speaker roster, budget, payment and library.',
    bureau: 'Bureau Manager is a higher level of Coordinator who handles event logistics: hotel booking, speaker travel, materials, venue setup and attendee reminders. Within the platform, the Bureau Manager usually has the ability to approve inquiries, review expenses, and view the global dashboard, program details, attendees, speaker roster, budget, payment and library.',
    project: 'Project Team is responsible for non-speaker-bureau programs. Within the platform, the Project Team usually has the ability to approve inquiries, review expenses, and view the global dashboard, program details, attendees, speaker roster, budget, payment and library.',
    administrator: 'Administrator is similar to Bureau Manager, handling event logistics: hotel booking, speaker travel, materials, venue setup and attendee reminders. Within the platform, the Administrator usually has the ability to approve inquiries, review expenses, and view the global dashboard, program details, attendees, speaker roster, budget, payment and library.',
    superadmin: 'Administrator is similar to Bureau Manager, handling event logistics: hotel booking, speaker travel, materials, venue setup and attendee reminders. Within the platform, the Administrator usually has the ability to approve inquiries, review expenses, and view the global dashboard, program details, attendees, speaker roster, budget, payment and library.',
    accounting: 'The Accounting Team is made up of two sub-teams. The Revenue Team is responsible for billing, revenue recognition and financial reporting. The Reconciliation Team validates documentation and reconciles expenses between the platform, [the corporate card platform] and [the accounting software]. Together they oversee the key financial reports and operations: the global report, the check request report, the Sunshine report and corporate card operations.',
    compliance: 'Compliance ensures every action and speaker engagement complies with medical regulations and company policy. Within the platform, Compliance usually has the ability to view the program calendar, speaker roster and library.',
    auditor: 'Auditor runs the audit trail over business and system operations. Within the platform, the Auditor usually has the ability to view the program calendar, speaker roster and library.',
    speaker: 'Speaker is a healthcare professional (HCP) invited to speak. Speakers see their events, prepare presentations and receive honoraria. Within the platform, the Speaker usually has the ability to sign contracts, view upcoming and past events, submit use cases and sort slides in a presentation, submit and review expense forms, check payment status for honoraria, view payment history, and view program details and library.',
    attendee: 'Attendee is not a role in the current portal, but is a user in the speaker bureau business. An attendee joins the session — a doctor or internal staff — and may give feedback, answer surveys or receive certificates. Within the platform, the Attendee usually has the ability to view upcoming events, register for an event, receive notifications and updates about it, sign in on the day, and give feedback afterwards.'
  };

  /* The user journeys drawn in each role's "2.2 User journeys" figures, steps
     in figure order. `lanes` is where those steps land on the 13 areas; a
     role's "most used" areas are these lanes intersected with the cells it
     actually holds (see hot()), so a journey never lights an area the role
     has no permission in. Speaker nomination ends in Sign contract, which
     only Brand Manager and Home Office hold. */
  var JOURNEYS = {
    launch: {
      name: 'Launch playbook',
      steps: ['Sign in', 'Launch playbook', 'Upgrade to Representative'],
      lanes: ['onboarding']
    },
    program: {
      name: 'Program request journey',
      steps: ['Initiate program request', 'Approve program request', 'Generate program ID', 'Assign coordinator'],
      lanes: ['program']
    },
    nomination: {
      name: 'Speaker nomination journey',
      steps: ['Initiate speaker nomination request', 'Approve speaker nomination request', 'Sign contract', 'Complete training'],
      lanes: ['nomination', 'contracting']
    },
    exception: {
      name: 'Exception request journey',
      steps: ['Submit inquiry', 'Review inquiry internally', 'Approve inquiry'],
      lanes: ['inquiry']
    },
    check: {
      name: 'Check request journey',
      steps: ['Submit expense form and receipts', 'Calculate honoraria fee', 'Break down cost items', 'Request check', 'Update payment information', 'Mark checklist'],
      lanes: ['expense', 'payment']
    },
    speaker: {
      name: 'Speaker journey',
      steps: ['Sign contract', 'Complete training', 'Review presentation', 'Conduct speaking', 'Review payment'],
      lanes: ['contracting', 'library', 'payment']
    },
    reconciliation: {
      name: 'Reconciliation journey',
      steps: [
        'Run report in [the accounting software]', 'Run global report by month', 'Select a program from the report',
        'Check the attendee is not duplicated and under the speaker cap', 'Check the attendee has an NPI or client ID and a signature',
        'Check the required forms and receipts are uploaded', 'Check cost items in payment history are correct and attached',
        'Mark each payment history item QA verified', 'Mark final verification',
        'Data is pulled to the payment aggregator', 'Sunshine report pulls verified, not-yet-reported data'
      ],
      lanes: ['reporting', 'registration', 'expense', 'payment', 'recon']
    }
  };

  /* Compliance and Auditor have no journey section; Attendee's reads "TBU". */
  var ROLE_JOURNEYS = {
    rookie: ['launch'],
    representative: ['program', 'nomination'],
    msl: ['nomination'],
    division: ['program', 'nomination'],
    region: ['program', 'nomination'],
    brand: ['program', 'nomination'],
    homeoffice: ['program', 'nomination'],
    coordinator: ['exception', 'check'],
    bureau: ['exception', 'check'],
    project: ['exception', 'check'],
    administrator: ['exception', 'check'],
    superadmin: ['exception', 'check'],
    accounting: ['reconciliation'],
    speaker: ['speaker']
  };

  ROLES.forEach(function (r) {
    r.overview = OVERVIEWS[r.id];
    r.journeys = ROLE_JOURNEYS[r.id] || [];
  });

  /* Roles whose permission sentence is identical, word for word, to another
     role's. 17 roles resolve to 12 distinct permission sets. */
  var DUPLICATES = [
    ['brand', 'homeoffice'],
    ['compliance', 'auditor'],
    ['bureau', 'project', 'administrator', 'superadmin']
  ];

  function has(role, laneId) { return Object.prototype.hasOwnProperty.call(role.cells, laneId); }
  function count(role) { return LANES.filter(function (l) { return has(role, l.id); }).length; }
  function gaps(role) {
    return LANES.filter(function (l) { return !has(role, l.id); }).map(function (l) { return l.label; });
  }
  function dupPartners(id) {
    for (var i = 0; i < DUPLICATES.length; i++) {
      if (DUPLICATES[i].indexOf(id) !== -1) {
        return DUPLICATES[i].filter(function (x) { return x !== id; });
      }
    }
    return [];
  }
  /* Where a role's work actually sits: the contiguous runs of areas it holds,
     rendered as ranges. "Shared features" is excluded — every role has it, so
     it says nothing about this role. */
  function focus(role) {
    var runs = [], run = null;
    LANES.forEach(function (l) {
      if (l.id === 'shared') return;
      if (has(role, l.id)) {
        if (run) { run.push(l.label); } else { run = [l.label]; }
      } else if (run) { runs.push(run); run = null; }
    });
    if (run) runs.push(run);
    return runs.map(function (r) {
      return r.length === 1 ? r[0] : r[0] + ' \u2192 ' + r[r.length - 1];
    });
  }

  function nameOf(id) {
    for (var i = 0; i < ROLES.length; i++) { if (ROLES[i].id === id) return ROLES[i].name; }
    return id;
  }

  /* True where one of the role's own journeys runs through an area it holds. */
  function hot(role, laneId) {
    if (!has(role, laneId)) return false;
    return role.journeys.some(function (j) { return JOURNEYS[j].lanes.indexOf(laneId) !== -1; });
  }

  return {
    lanes: LANES, roles: ROLES, duplicates: DUPLICATES, groups: GROUPS,
    journeys: JOURNEYS,
    distinctSets: 12,
    has: has, count: count, gaps: gaps, focus: focus, hot: hot,
    dupPartners: dupPartners, nameOf: nameOf
  };
})();
