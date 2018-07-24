MVP

- [x] Add members to an org
- [x] Email member when they are added to an org or activity
- [x] Show members of an org, activity, or spot
- [x] Batch create spots
- [x] Email notification on upcoming spot
- [x] Fix other org members seeing each others spots on the home page (and potentially elsewhere)
- [x] Fix timezone issues
- [x] Replace moment with luxon/datefns
- [x] Fix Spot deletion when signups have happened
- [x] Cronjob to send notifications
- [x] Better visual confirmation if a spot is filled or not on SpotList page
- [x] Fix permissions for non-admin users on signing up for a spot

Beta 1

- [x] Authentication for notification routes
- [x] Upgrade Apollo to latest recommended use
- [x] Filter on SpotList page to hide/show past spots
- [x] Update notification to happen daily on a rolling basis
- [x] Allow user to note unavailability for a Spot
- [x] Resolve double JSS invocation? in production
- [x] Complete optimized Dockerfile build
- [x] Add a privacy policy
- [x] Ability to cancel a spot from the home screen (with confirmation)
- [x] Fix not being able to select anything other than the first org when making an activity
- [x] Resolve setState called in render() of SpotModal
- [x] Remove redux

Beta 2

- [x] Fix automatic login setState issue on Landing
- [x] Fix sign in when you started from the home page
- [x] Publish to Github
- [x] Email notification on unfilled Spot 3 days out
- [x] Sort WhatsOpen page by date, not by activity then date
- [x] Extend cookie timeout to 1 month
- [x] Email notification on activity summary to admins
- [ ] Google calendar integration
- [ ] Signup other members for a spot administratively
- [ ] Success/error toaster on adding people to an org
- [ ] Success/error toaster on adding people to an activity
- [ ] Remove user from org/activity
- [ ] Remove user from spot (admin)
- [ ] Fix key issue warning on Home.tsx when canceling a spot
- [ ] Show other people who are volunteering for the same day/organization when sending email notification

  1.0

- [ ] Better handling for slow connections on actions / optimistic UI
- [ ] Improve Modal situation if warranted
- [ ] Web push notifications
- [ ] Calendar view
- [ ] Add rolling spot deletion for > 1 year

  1.1

- [ ] Reporting views

Nice to have

- [ ] Reduce bundle size
- [ ] More granular hot reloading (current just reloads page)
