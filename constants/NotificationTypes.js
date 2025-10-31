export const NotificationTypes = {
  Hotlead: 'Hotlead', //sent at 8 pm
  TotalHotlead: 'TotalHotlead', // sent at 8 pm
  MeetingBooked: 'MeetingBooked',
  PaymentFailed: 'PaymentFailed',
  NoCallsIn3Days: 'NoCallsIn3Days',
  LeadCalledBack: 'LeadCalledBack',
  InviteAccepted: 'InviteAccepted',
  CallsMadeByAgent: 'CallsMadeByAgent',
  RedeemedAgentXCode: 'RedeemedAgentXCode', // 30 min added for using AgentX Code
  RedeemedAgentXCodeMine: 'RedeemedAgentXCodeMine', // 30 min added for using your AgentX Code
  Redeemed60Min: 'Redeemed60Min', // 1 hour after the subscription

  //No Payment Added Notifications
  NoPaymentAdded: 'NoPaymentAdded', //Immediately after acount creation
  NoPaymentFoMo: 'NoPaymentFoMo', //Day 3: Your AI is Waiting to Work for You!
  NoPaymentScarcity: 'NoPaymentScarcity', //Day 5:
  NoPaymentUrgentWarning: 'NoPaymentUrgentWarning', // Day 7:
  NoPaymentAiReset: 'NoPaymentAiReset', // Day 10:
  //Trial Related
  Trial30MinTicking: 'Trial30MinTicking',
  //Day1
  X3MoreLikeyToWin: '3xMoreLikeyToWin', //3x more likely to win/ send 3 hours after account creation
  //Day2: Same time as on first day
  NeedHand: 'NeedHand',
  //Day 3
  TrialReminder: 'TrialReminder',
  //Day 5
  NeedHelpDontMissOut: 'NeedHelpDontMissOut',
  //Day 6
  LastChanceToAct: 'LastChanceToAct',
  //Day 7
  LastDayToMakeItCount: 'LastDayToMakeItCount',
  TrialTime5MinLeft: 'TrialTime2MinLeft', // when two minutes of trial time is left
  PlanRenewed: 'PlanRenewed',
  SubscriptionRenewed: 'SubscriptionRenewed',
  PlanUpgraded: 'PlanUpgraded',
  PlanDowngraded: 'PlanDowngraded',
  PlanCancelled: 'PlanCancelled',
  AccountPaused: 'AccountPaused',
  AccountResumed: 'AccountResumed',

  //Gamifications
  FirstLeadUpload: 'FirstLeadUpload', //First Lead list upload
  ThousandCalls: 'ThousandCalls', // 1 K Calls
  Inactive5Days: 'Inactive5Days', // Inactive 5 days, email
  TwoThousandCalls: 'TwoThousandCalls', // 2 K Calls
  FirstAppointment: 'FirstAppointment',
  ThreeAppointments: 'ThreeAppointments',
  SevenAppointments: 'SevenAppointments',
  Day14FeedbackRequest: 'Day14FeedbackRequest', //email as well
  TestAINotification: 'TestAINotification', //First AI is created
  PlanUpgradeSuggestionFor30MinPlan: 'PlanUpgradeSuggestionFor30MinPlan', //email, Plan Upgrade Suggestion (only for 30 min active plans after 2nd charge)

  //Inactive Notifications
  SocialProof: 'SocialProof', //1 day later, has email
  CompetitiveEdge: 'CompetitiveEdge', //3 day later
  FOMOAlert: 'FOMOAlert', // 5 days later, has email
  TrainingReminder: 'TrainingReminder', //7 days later
  Exclusivity: 'Exclusivity', //14 days later, has email
  TerritoryUpdate: 'TerritoryUpdate', //20 days later, has email

  SubscriptionRenewalIn24Hour: 'SubscriptionRenewalIn24Hour',
  AutoMinuteTopupNotificaiton: 'AutoMinuteTopupNotificaiton',
  PlanSubscribed: 'PlanSubscribed'

}