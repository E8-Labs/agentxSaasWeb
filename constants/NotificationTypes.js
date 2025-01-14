export const NotificationTypes = {
  Hotlead: "Hotlead", //sent at 8 pm
  TotalHotlead: "TotalHotlead", // sent at 8 pm
  MeetingBooked: "MeetingBooked",
  PaymentFailed: "PaymentFailed",
  NoCallsIn3Days: "NoCallsIn3Days",
  LeadCalledBack: "LeadCalledBack",
  InviteAccepted: "InviteAccepted",
  CallsMadeByAgent: "CallsMadeByAgent",
  RedeemedAgentXCode: "RedeemedAgentXCode", // 30 min added for using AgentX Code
  RedeemedAgentXCodeMine: "RedeemedAgentXCodeMine",
  Redeemed60Min: "Redeemed60Min", // 1 hour after the subscription

  //Trial Related
  Trial30MinTicking: "Trial30MinTicking",
  //Day1
  X3MoreLikeyToWin: "3xMoreLikeyToWin", //3x more likely to win/ send 3 hours after account creation
  //Day2: Same time as on first day
  NeedHand: "NeedHand",
  //Day 3
  TrialReminder: "TrialReminder",
  //Day 5
  NeedHelpDontMissOut: "NeedHelpDontMissOut",
  //Day 6
  LastChanceToAct: "LastChanceToAct",
  //Day 7
  LastDayToMakeItCount: "LastDayToMakeItCount",
  TrialTime2MinLeft: "TrialTime2MinLeft", // when two minutes of trial time is left
  PlanRenewed: "PlanRenewed",

  //Gamifications
  FirstLeadUpload: "FirstLeadUpload", //First Lead list upload
  ThousandCalls: "ThousandCalls", // 1 K Calls
  Inactive5Days: "Inactive5Days", // Inactive 5 days, email
  TwoThousandCalls: "TwoThousandCalls", // 2 K Calls
  FirstAppointment: "FirstAppointment",
  ThreeAppointments: "ThreeAppointments",
  SevenAppointments: "SevenAppointments",
  Day14FeedbackRequest: "Day14FeedbackRequest", //email as well
  TestAINotification: "TestAINotification", //First AI is created
  PlanUpgradeSuggestionFor30MinPlan: "PlanUpgradeSuggestionFor30MinPlan", //email, Plan Upgrade Suggestion (only for 30 min active plans after 2nd charge)
};