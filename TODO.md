**docgrind MVP - Product Memo**

## Screens/Views

- [ ] Session Mode Selection Screen - User chooses between 5min/15min/joy/zen time modes
- [ ] Reading View - Displays MDN content with current position tracking
- [ ] Chapter Completion Screen - Shows "Chapter complete!" with transition to exercises
- [ ] Exercise View - Displays LLM-generated challenge with code editor
- [ ] Progress Dashboard - Shows reading stats, streak chart, and shareable progress
- [ ] Chapter Selection View - Browse all MDN chapters with completion status

## Core Features

- [ ] Session Time Modes - 5min, 15min, joy (1hr), zen (unlimited) options
- [ ] Reading Position Tracking - Saves exact scroll position within chapters
- [ ] Chapter Progress Tracking - Percentage complete for current chapter
- [ ] Exercise Generation - LLM creates 3 exercises upon chapter completion
- [ ] GitHub-style Contribution Chart - Visual daily reading streak
- [ ] Progress Persistence - All data saved to localStorage
- [ ] Resume vs Restart Option - Choose to continue or restart a chapter
- [ ] Overall Progress Metric - Percentage of total MDN docs completed
- [ ] Daily Stats - Chapters read, exercises completed, time spent
- [ ] Shareable Dashboard State - Screenshot-friendly progress view

## Reminder System

- [ ] Email Notifications - Sends at 12pm, 3pm, 6pm if no session that day
- [ ] Streak Preservation Messaging - "You have a X day streak! 5 minutes to keep it!"

## MVP Acceptance Criteria

- [ ] User can track reading progress through MDN JavaScript documentation
- [ ] Progress persists between sessions without data loss
- [ ] User receives 3 practice exercises after completing each chapter
- [ ] Dashboard displays GitHub-style daily activity chart
- [ ] Email reminders sent on days with no activity
- [ ] All progress data is shareable/screenshottable
- [ ] User can choose session length before starting
- [ ] User can resume where they left off or restart chapters