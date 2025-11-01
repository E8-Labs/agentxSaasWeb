export const StandardNotificationsList = [
    {
        id: 1,
        title: "Team member Invite email",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Welcome to the AgentX Team! 🎉",
        subjectDescription: "Hi [First Name], [Admin First Name] has invited you to join their team on AgentX! Click the link below to accept your invitation and get access. [Accept Invitation] If you have any questions, feel free to reach out to the person who invited you directly or contact our support team for assistance. Welcome to the team! Best, The AgentX Team",
        CTA: "View Your Team Dashboard"
    },
    {
        id: 2,
        title: "30 mins added for using {Agent Code}",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "You've Just Earned 30 More Minutes! ✨",
        subjectDescription: "Hi [Name], Congratulations! You've just unlocked 30 additional minutes of AI talk time using your Agent Code: {Agent Code}. This bonus time will help you reach more prospects and close more deals. Make the most of this opportunity by uploading fresh leads and starting your calls right away. Best regards, The AgentX Team",
        CTA: "Upload Leads and Start Calling"
    },
    {
        id: 3,
        title: "{Teamname} accepted your invite",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "[Teamname] joined AgentX!",
        subjectDescription: "Hi [Name], Great news! Your team, {Teamname}, has officially joined AgentX. What's next? You can now collaborate with your team members, share leads, and work together to maximize your success. Welcome aboard! Best, The AgentX Team",
        CTA: "View Your Team Dashboard"
    },
    {
        id: 4,
        title: "{Leadname} is a hot lead 🔥",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "New Hot Lead Alert: {Leadname}",
        subjectDescription: "Hi [Name], Exciting news—your AI has identified a hot lead! Here are the details: Lead Name: {Leadname} This lead has shown high engagement and interest. Don't miss this opportunity to connect and convert. Best regards, The AgentX Team",
        CTA: "View Hot Lead and Take Action"
    },
    {
        id: 5,
        title: "{Leadname} booked a meeting 🗓️",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Meeting Booked: {Leadname}",
        subjectDescription: "Hi [Name], Exciting news! {Leadname} has just booked a meeting. This is a perfect opportunity to make progress toward closing the deal. Make sure you're prepared for the meeting and follow up promptly. Best regards, The AgentX Team",
        CTA: "View Lead and Meeting Details"
    },
    {
        id: 6,
        title: "Urgent! Payment method failed",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Urgent: Payment Method Failed—Action Required 🚨",
        subjectDescription: "Hi [Name], We noticed an issue with your payment method, and your account is currently unable to process calls. To keep your AI up and running, please update your payment details immediately. Don't let this interrupt your success! Best regards, The AgentX Team",
        CTA: "Update Payment Method Now"
    },
    {
        id: 7,
        title: "Your calls have stopped for 3 days. Need help?",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Your Calls Have Stopped—Let's Get Back on Track! 📞",
        subjectDescription: "Hi [Name], We noticed your AI hasn't made any calls for 3 days. Is everything okay? Don't worry, we're here to help you get back on track. Join our live webinar to learn best practices and get your AI calling again. Best regards, The AgentX Team",
        CTA: "Join the Live Webinar Now"
    },
    {
        id: 8,
        title: "USE ON DESKTOP EMAIL",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Welcome to AgentX! Continue on Desktop",
        subjectDescription: "Hey Visionary, Welcome to AgentX, where we redefine what's possible in real estate. You've just taken the first step toward building your own AI—a tool so powerful, it could reshape how you do business. Continue your journey on desktop for the full experience. Best regards, The AgentX Team",
        CTA: "Continue on Desktop"
    },
]


//trial period notifications
export const TrialPeriodNotificationsList = [
    // Day 1: 1hr after creating account
    {
        id: 1,
        title: "Day 1: 1hr after creating account",
        description: "{{ When email is sent }}",
        tootTip: "Sent 1 hour after account creation",
        appNotficationTitle: "30 min Trial is Ticking!",
        appNotficationBody: "Your 30 min trial expires in 7 days. Start now to make the most of it!",
        appNotficationCTA: "Start Calling",
        emailNotficationTitle: "Your 30-Minute Trial is Ticking!",
        emailNotficationBody: "Hi [First Name],\nWelcome to AgentX! Your 7-day trial has started, and your 30 minutes of AI-powered talk time are ready. Agents who start early see the best results—don't wait!",
        emailNotficationCTA: "Start Calling",
    },
    // Day 1: 3hrs After creating an account if they haven't added leads
    {
        id: 2,
        title: "Day 1: 3hrs After creating an account if they haven't added leads",
        description: "{{ When email is sent }}",
        tootTip: "Sent 3 hours after account creation if no leads added",
        appNotficationTitle: "3x More Likely to Win!",
        appNotficationBody: "Agents who upload leads on Day 1 book 3x more listings. Don't miss out!",
        appNotficationCTA: "Upload Leads",
        emailNotficationTitle: "3x More Likely to Win!",
        emailNotficationBody: "Hi [First Name].\nDid you know that agents who upload their leads on Day 1 are 3x more likely to book a listing appointment during their trial?",
        emailNotficationCTA: "Upload Leads",
    },
    // Day 2: Exactly 24 hrs later. If they haven't added leads
    {
        id: 3,
        title: "Day 2: Exactly 24 hrs later. If they haven't added leads",
        description: "{{ When email is sent }}",
        tootTip: "Sent 24 hours later if no leads added",
        appNotficationTitle: "Need a Hand?",
        appNotficationBody: "Didn't get through everything in the live training? We can help.",
        appNotficationCTA: "Get Support",
        emailNotficationTitle: "Need a Hand?",
        emailNotficationBody: "Hi [First Name].\nMissed Something in your live training? We've Got You Covered!\nIf you didn't have time to cover everything in onboarding, don't worry—we're here to help.",
        emailNotficationCTA: "Get Support",
    },
    // Day 3: 24hrs later
    {
        id: 4,
        title: "Day 3: 24hrs later",
        description: "{{ When email is sent }}",
        tootTip: "Sent 24 hours later",
        appNotficationTitle: "Trial Reminder! ⏳",
        appNotficationBody: "Your 30 min trial ends soon. Use them or lose them—call opportunities now!",
        appNotficationCTA: "Start Calling",
        emailNotficationTitle: "Trial Reminder: Don't Let It Slip Away!",
        emailNotficationBody: "Hi [First Name],\nYour trial is moving fast! You have unused trial minutes of AI talk time, and your trial ends soon.",
        emailNotficationCTA: "Start Calling",
    },
    // Day 5: 48hrs later.
    {
        id: 5,
        title: "Day 5: 48hrs later.",
        description: "{{ When email is sent }}",
        tootTip: "Sent 48 hours later",
        appNotficationTitle: "Need help? Don't Miss Out! 🎁",
        appNotficationBody: "Only 2 days left to use your 30 minutes! Agents are booking $700k+ listings",
        appNotficationCTA: "Get Live Support",
        emailNotficationTitle: "Only 2 Days Left to Maximize Your Trial",
        emailNotficationBody: "Hi [First Name],\nTime is ticking! With only 2 days left in your trial, this is your chance to take action.\nAgents who start early are already seeing results—some booking listings worth $700k",
        emailNotficationCTA: "Get Live Support",
    },
    // Day 6: 48hrs later
    {
        id: 6,
        title: "Day 6: 48hrs later",
        description: "{{ When email is sent }}",
        tootTip: "Sent 48 hours later",
        appNotficationTitle: "Last Chance to Act! ⏰",
        appNotficationBody: "Only 1 day left to use your 30 minutes of AI talk time.",
        appNotficationCTA: "Get Live Help",
        emailNotficationTitle: "1 Day Left to Use Your AI Talk Time!",
        emailNotficationBody: "Hi [First Name],\nYour trial is almost up! With just 1 day left, it's time to make the most of your 30 minutes of AI talk time.\nCTA: Need help? Schedule a live support session now!",
        emailNotficationCTA: "Need help? Schedule a live support session now!",
    },
    // Day 7:
    {
        id: 7,
        title: "Day 7:",
        description: "{{ When email is sent }}",
        tootTip: "Sent on day 7",
        appNotficationTitle: "Last Day to Make It Count! ⏰",
        appNotficationBody: "Final call! Your 30 minutes of AI talk time expire at midnight.",
        appNotficationCTA: "Get Live Help",
        emailNotficationTitle: "Your Trial Ends Tonight at Midnight ⏰",
        emailNotficationBody: "Hi [First Name],\nIt's your final chance! Your 30 minutes of AI talk time expire at midnight tonight.\nAgents using AgentX are seeing results, with some securing 2-3 listing appointments",
        emailNotficationCTA: "Get Live Help",
    },
    // Day X: When only 5 mins of trial time left
    {
        id: 8,
        title: "Day X: When only 5 mins of trial time left",
        description: "{{ When email is sent }}",
        tootTip: "Sent when only 5 minutes of trial time left",
        appNotficationTitle: "5 min reminder!",
        appNotficationBody: "Just 5 minutes left! Your plan will auto-renew.",
        appNotficationCTA: "Manage Plan",
        emailNotficationTitle: "Just 5 Minutes Left on Your Trial!",
        emailNotficationBody: "Hi [First Name],\nYour 30-minute trial is almost up—you've got just 5 minutes left to make the most of it!\nYour plan will automatically renew at your selected plan, so you can keep calling without interruption.",
        emailNotficationCTA: "Manage Plan",
    },
    // When minutes auto renew
    {
        id: 9,
        title: "When minutes auto renew",
        description: "{{ When email is sent }}",
        tootTip: "Sent when minutes are auto-renewed",
        appNotficationTitle: "Minutes Have Been Renewed! 🎉",
        appNotficationBody: "(30/90/120/etc) Minutes Added. Keep calling opportunities!",
        appNotficationCTA: "Manage Plan",
        emailNotficationTitle: "(120) minutes have been renewed! 🎉",
        emailNotficationBody: "Hi [First Name],\nYour plan has been renewed, and (120 minutes) have been added to your account for {$99}. You're all set to continue making calls and booking opportunities.",
        emailNotficationCTA: "Manage Plan",
    },
]


//post trial period notifications
export const PostTrialPeriodNotificationsList = [
    // 1 Day Later: Social Proof
    {
        id: 1,
        title: "1 Day Later: Social Proof",
        description: "{{When email is sent}}",
        tootTip: "Sent 1 day after trial ends",
        appNotficationTitle: "Sarah in [City] got 2 Listings!",
        appNotficationBody: "Sarah from [Same City] closed 2 listings last week!",
        appNotficationCTA: "Start Calling",
        emailNotficationTitle: "Sarah from [Same City] closed 2 listings last week!",
        emailNotficationBody: "Hi [Name], It's a numbers game, and Sarah from [Same City] knows it. She closed 2 listings last week using AgentX.",
        emailNotficationCTA: "Upload Leads and Start Calling",
    },
    // 3 Days Later: Competitive Edge
    {
        id: 2,
        title: "3 Days Later: Competitive Edge",
        description: "{{When email is sent}}",
        tootTip: "Sent 3 days after trial ends",
        appNotficationTitle: "Secure Your Edge!",
        appNotficationBody: "Few agents in [Same City] use AI. Act before others join.",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // 5 Days Later: FOMO Alert
    {
        id: 3,
        title: "5 Days Later: FOMO Alert",
        description: "{{When email is sent}}",
        tootTip: "Sent 5 days after trial ends",
        appNotficationTitle: "Don't Miss Out!",
        appNotficationBody: "4 listings secured in [Same City] in the last 2 weeks.",
        appNotficationCTA: "",
        emailNotficationTitle: "4 listing appointments secured near you!",
        emailNotficationBody: "Hi [Name], In the last 2 weeks, 4 listing appointments have been secured around [Same City]. The market is active, and other agents are making moves.",
        emailNotficationCTA: "Activate Your AI Now",
    },
    // 1 Week Later: Training Reminder
    {
        id: 4,
        title: "1 Week Later: Training Reminder",
        description: "{{When email is sent}}",
        tootTip: "Sent 1 week after trial ends",
        appNotficationTitle: "Need Help?",
        appNotficationBody: "Join our live webinar and book more appointments.",
        appNotficationCTA: "Get Help",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // 14 Days Later: Exclusivity
    {
        id: 5,
        title: "14 Days Later: Exclusivity",
        description: "{{When email is sent}}",
        tootTip: "Sent 14 days after trial ends",
        appNotficationTitle: "You're Leading!",
        appNotficationBody: "Few agents in [Same City] use AI. Maximize your lead.",
        appNotficationCTA: "Get Live Support",
        emailNotficationTitle: "You're leading the way in your area!",
        emailNotficationBody: "Hi [Name], Right now, you're part of a select group of agents in [Same City] leveraging AI to secure more listings. Others are catching on, but you've got the advantage.",
        emailNotficationCTA: "Start Now and Stay Ahead",
    },
    // 20 Days Later: Territory Update
    {
        id: 6,
        title: "20 Days Later: Territory Update",
        description: "{{When email is sent}}",
        tootTip: "Sent 20 days after trial ends",
        appNotficationTitle: "2 Listings Nearby!",
        appNotficationBody: "2 appointments made within 20 miles. Don't miss out!",
        appNotficationCTA: "",
        emailNotficationTitle: "Your territory is heating up!",
        emailNotficationBody: "Hi [Name], Exciting news—2 listing appointments were recently secured within a 20-mile radius of your territory. The market is moving fast, and now's your chance to capitalize.",
        emailNotficationCTA: "Start Winning Listings",
    },
]


//gamification notifications
export const GamificationNotificationList = [
    // After Uploading First Leads
    {
        id: 1,
        title: "After Uploading First Leads",
        description: "{{When email is sent}}",
        tootTip: "Sent after user uploads their first leads",
        appNotficationTitle: "Congrats on Your First Upload!",
        appNotficationBody: "Let's start calling to get 🔥 leads!",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // After 1K Calls
    {
        id: 2,
        title: "After 1K Calls",
        description: "{{When email is sent}}",
        tootTip: "Sent after user makes 1,000 calls",
        appNotficationTitle: "You're in the Top 40%!",
        appNotficationBody: "Keep going—top 20% are booking 3+ listings this month!",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // When User Is Inactive for 5 days
    {
        id: 3,
        title: "When User Is Inactive for 5 days",
        description: "{{When email is sent}}",
        tootTip: "Sent if user is inactive for 5 days",
        appNotficationTitle: "We Noticed You Haven't Made Calls This Week",
        appNotficationBody: "Call 200 homeowners to see a 10x increase in hot leads.",
        appNotficationCTA: "",
        emailNotficationTitle: "We Noticed You Haven't Made Calls This Week",
        emailNotficationBody: "Hi [Name],\nDid you know agents who call 200 homeowners see a 10x increase in hot leads? You've got the tools—let's help you fill your pipeline and secure your next listing appointment.",
        emailNotficationCTA: "Start Calling",
    },
    // After 2K Calls
    {
        id: 4,
        title: "After 2K Calls",
        description: "{{When email is sent}}",
        tootTip: "Sent after user makes 2,000 calls",
        appNotficationTitle: "You're in the Top 30%!",
        appNotficationBody: "Keep it up—top 10% are booking 4+ listings this month!",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // After First Appointment
    {
        id: 5,
        title: "After First Appointment",
        description: "{{When email is sent}}",
        tootTip: "Sent after user books their first appointment",
        appNotficationTitle: "Congrats on Your First Appointment!",
        appNotficationBody: "This is just the beginning. Let's keep the momentum going!",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // After 3 Appointments
    {
        id: 6,
        title: "After 3 Appointments",
        description: "{{When email is sent}}",
        tootTip: "Sent after user books 3 appointments",
        appNotficationTitle: "Hat Trick Secured! 🥳",
        appNotficationBody: "3 appointments booked—keep it rolling!",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // After 7 Appointments
    {
        id: 7,
        title: "After 7 appointments",
        description: "{{When email is sent}}",
        tootTip: "Sent after user books 7 appointments",
        appNotficationTitle: "You're on Fire! 🔥",
        appNotficationBody: "7 streak achieved—your competition doesn't stand a chance!",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // Day 14 Feedback Request
    {
        id: 8,
        title: "Day 14 Feedback Request",
        description: "{{When email is sent}}",
        tootTip: "Sent 14 days after account creation to request feedback",
        appNotficationTitle: "We'd Love Your Feedback!",
        appNotficationBody: "Share your experience so we can make AgentX better for you.",
        appNotficationCTA: "Feedback",
        emailNotficationTitle: "How's Your AgentX Experience So Far?...",
        emailNotficationBody: "Hi [Name],\nWe'd love to hear about your AgentX experience so far! Your feedback helps us improve and ensure your success.",
        emailNotficationCTA: "Share Feedback",
    },
    // Test Your AI Notification (After creating their first AI)
    {
        id: 9,
        title: "Test Your AI Notification (After creating their first AI)",
        description: "{{When email is sent}}",
        tootTip: "Sent after user creates their first AI",
        appNotficationTitle: "Test Your AI!",
        appNotficationBody: "Make sure your AI delivers quality results.",
        appNotficationCTA: "",
        emailNotficationTitle: "",
        emailNotficationBody: "",
        emailNotficationCTA: "",
    },
    // Plan Upgrade Suggestion (only for 30 min active plans after 2nd charge)
    {
        id: 10,
        title: "Plan Upgrade Suggestion (only for 30 min active plans after 2nd charge)",
        description: "{{When email is sent}}",
        tootTip: "Sent to users on 30 min active plans after 2nd charge",
        appNotficationTitle: "Save Big—Upgrade!",
        appNotficationBody: "Upgrade to 120 mins and save 40%.",
        appNotficationCTA: "",
        emailNotficationTitle: "Upgrade and Save!...",
        emailNotficationBody: "Hi [Name],\nYou're currently on the 30 min plan. By upgrading to 120 mins, you'll save 40% on your calling costs.",
        emailNotficationCTA: "Upgrade Plan",
    },
]