# Pronunciation Rules for Calendar Receptionist Agent

Add these rules to your Atoms agent (prompt or Pronunciation Dictionary in Voice Settings) so the agent speaks times, dates, and conventions naturally.

---

## Backend Fix (Already Applied)

The backend now outputs **"9 AM"** instead of **"9:00 AM"** for on-the-hour times, which avoids TTS pronouncing "nine colon zero zero" or "nine hundred". Half hours still use "11:30 AM".

---

## COPY-PASTE FOR ATOMS PROMPT (paste this block into your agent)

```
Pronunciation rules - when speaking to callers:
- Times: Say "nine A M" not "9am"; "eleven thirty P M" not "11:30pm"; "twelve P M" for noon
- Time ranges: "from nine A M to five P M" not "9am to 5pm"
- Months: Spell out "February" not "Feb", "March" not "Mar", "April" not "Apr", etc.
- Dates: "Friday, February 27th" or "Monday, March 2nd, 2026"
- Emails: Say "at" for @ and "dot" for periods - "malikaa at smallest dot ai" not "malikaa@smallest.ai"
- When reading available_summary or confirmation_message, convert abbreviations to spoken form before saying them
```

---

## Time Pronunciation

### AM / PM
- **Say:** "nine A M" or "nine ay em" (not "9am" as one word)
- **Say:** "eleven thirty P M" (not "11:30pm" run together)
- **Convention:** Pause slightly before "AM" or "PM" so it's clear: "at **9** … **A M**"

### On-the-Hour Times
- **9:00 AM** → "nine A M" or "nine o'clock in the morning"
- **12:00 PM** → "twelve P M" or "noon"
- **12:00 AM** → "twelve A M" or "midnight"
- **5:00 PM** → "five P M" or "five o'clock in the afternoon"

### Half-Hour Times
- **11:30 AM** → "eleven thirty A M" (say "thirty," not "half past" for consistency)
- **2:30 PM** → "two thirty P M"

### Quarter Times (if used)
- **11:15** → "eleven fifteen"
- **11:45** → "eleven forty-five"

### Time Ranges
- **9 AM to 5 PM** → "from nine A M to five P M"
- **11:00 AM - 11:30 AM** → "from eleven A M to eleven thirty A M"
- **Avoid:** "eleven to eleven thirty" (ambiguous)

---

## Date Pronunciation

### Month Abbreviations (when backend returns "Feb", "Mar", etc.)
- **Feb** → "February" (spell out when speaking)
- **Mar** → "March"
- **Apr** → "April"
- **Jun** → "June"
- **Jul** → "July"
- **Aug** → "August"
- **Sep** → "September"
- **Oct** → "October"
- **Nov** → "November"
- **Dec** → "December"

### Day + Date
- **Friday Feb 27** → "Friday, February 27th" or "Friday, February 27"
- **Monday, Mar 2, 2026** → "Monday, March 2nd, 2026" or "Monday, March 2, 2026"

### Ordinals (optional, for natural flow)
- **1st, 21st, 31st** → "first," "twenty-first," "thirty-first"
- **2nd, 22nd** → "second," "twenty-second"
- **3rd, 23rd** → "third," "twenty-third"
- **4th–20th, 24th–30th** → "fourth," "twentieth," etc.

---

## Availability Phrasing

### Full-Day Summary
- **Backend:** "Friday Feb 27: There is availability from 9AM to 5 PM"
- **Say:** "I have availability on Friday, February 27th, from nine A M to five P M."

### Slot List
- **Backend:** "Friday Feb 27: 11 AM, 11:30 AM, 12 PM"
- **Say:** "I have availability on Friday, February 27th at eleven A M, eleven thirty A M, and twelve P M. Which works for you?"

### Multiple Days
- **Backend:** "Friday Feb 27: 11 AM; Saturday Feb 28: 2 PM"
- **Say:** "On Friday the 27th I have eleven A M. On Saturday the 28th I have two P M."

---

## Email Pronunciation

- **@** → "at" (e.g., "malikaa at smallest dot ai")
- **.** → "dot" (e.g., "gmail dot com")
- **malikaa@smallest.ai** → "malikaa at smallest dot ai"
- **user@gmail.com** → "user at gmail dot com"

---

## Confirmation Message

- **Backend:** "Your meeting is confirmed for Monday, Mar 2, 2026, 3:00 AM - 3:30 AM. You'll receive a calendar invite at malikaa@smallest.ai."
- **Say:** "Your meeting is confirmed for Monday, March 2nd, 2026, from three A M to three thirty A M. You'll receive a calendar invite at malikaa at smallest dot ai."

---

## Atoms Pronunciation Dictionary (Voice Settings)

If Atoms supports custom pronunciations, add entries like:

| Word/Phrase | Pronunciation (how to say it) |
|-------------|-------------------------------|
| 9AM         | nine A M                      |
| 11:30       | eleven thirty                 |
| Feb         | February                      |
| Mar         | March                         |
| @           | at                            |
| .com        | dot com                       |
| .ai         | dot ai                        |

---

## Prompt Addition (Optional)

Add this to your agent prompt so the LLM outputs speakable text:

```
When speaking times and dates:
- Say "nine A M" not "9am"; "eleven thirty P M" not "11:30pm"
- Spell out month names: "February" not "Feb", "March" not "Mar"
- For emails, say "at" for @ and "dot" for periods: "user at gmail dot com"
- For time ranges: "from nine A M to five P M"
```
