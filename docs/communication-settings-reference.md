# Communication Settings – Reference (for later implementation)

Information pulled from UI screens. Use when implementing Communication Settings flows.

---

## Communication Settings (main screen)

Screen title: **Communication Settings**

**When an option is selected:** The chosen value appears under that category as a **light grey, rounded pill/chip** (e.g. under **Style** you see **Formal Tone** in a pill). So the main list shows both the category label and the current selection as a tag.

**Footer actions:** **Cancel** (left) | **Save Changes** (right, purple primary button).

Configurable items (each is a row with `>`; clicking opens further configuration):

1. **Style** – Overall tone or manner of communication (see existing `COMMUNICATION_STYLES` in `components/constants/constants.js`).
2. **Tailoring Communication** – How the user adapts communication in different conversations (options below).
3. **Sentence Structure** – Preferences for simple, complex, formal, or informal sentence construction.
4. **Expressing Enthusiasm** – How much or in what way enthusiasm is conveyed.
5. **Explaining Complex Concepts** – How detailed, simplified, or step-by-step explanations are (for intricate topics).
6. **Giving updates** – Frequency, detail level, or format of status updates.
7. **Handling Objections** – How the user handles objections or concerns from clients (see Handling Objections modal).

---

## Tailoring Communication (modal)

**Modal title:** Tailoring Communication  

**Question:** “How do you tailor your communication style in different conversations?”

**Options (radio selection):**

1. **I adjust my formality level.**
2. **I adapt my enthusiasm and energy level.**
3. **I modify my language complexity.**
4. **I don't change my style; I stay consistent.**
5. **I adjust based on client's expressed preferences.**

Actions: **Cancel** | **Save** (purple).

---

## Sentence Structure (modal)

**Modal title:** Sentence Structure  

**Question:** “Do you prefer to use short, concise sentences or more elaborate, detailed explanations?”

**Options (radio selection):**

1. **Short and concise sentences.**
2. **Elaborate and detailed explanations.**
3. **A balanced mix of both, depending on the situation.**
4. **I adapt my sentence structure to match the client's preference.**
5. **I vary my approach based on the complexity of the information.**

Actions: **Cancel** | **Save** (purple).

---

## Expressing Enthusiasm (modal)

**Modal title:** Expressing Enthusiasm  

**Question:** “How do you typically express enthusiasm or excitement in a conversation?”

**Options (radio selection; each has a short description + example):**

1. **Upbeat Tone**
   - Best for: infectious enthusiasm  
   - Ex: “I show excitement through my voice and positive energy.”

2. **Highlighting Standout Benefits**
   - Best for: value-focused conversations  
   - Ex: “I get excited by calling out what makes something special.”

3. **Expressive Language**
   - Best for: high-energy communication  
   - Ex: “I use exclamations or energetic phrasing to show excitement.”

4. **Personal Relevance**
   - (Description and example not fully visible in reference; add when available.)

5. **Descriptive Storytelling**
   - Best for: immersive conversations  
   - Ex: “I paint a vivid picture so they can imagine the experience.”

Actions: **Cancel** | **Save** (purple).

---

## Explaining Complex Concepts (modal)

**Modal title:** Explaining Complex Concepts  

**Question:** “Which example best represents how you explain complex concepts or terms to clients?” (or similar—select approach that best represents how you explain.)

**Options (radio selection; each has description + example):**

1. **Simplified with Analogies**
   - Best for: quick understanding  
   - Ex: “I like to explain it in everyday terms so it's easy to grasp.”

2. **Visual or Illustrative**
   - Best for: visual learners  
   - Ex: “I prefer visuals or diagrams to make things clearer.”

3. **Step-by-Step Breakdown**
   - Best for: structured thinkers  
   - Ex: “I walk through it in a clear sequence so nothing is missed.”

4. **Real-World Examples**
   - Best for: practical understanding  
   - Ex: “I use real scenarios or past experiences to make it relatable.”

5. **Shared Resources**
   - Best for: self-guided learners  
   - Ex: “I point people to helpful articles, videos, or guides for deeper clarity.”

Actions: **Cancel** | **Save** (purple).

---

## Giving updates (modal)

**Modal title:** Giving updates  

**Question:** “How do you approach giving updates or bad news?”

**Options (radio selection; each has example phrase + “Best for”):**

1. **Direct and Straightforward**
   - Ex: “I want to be upfront—this didn't move forward as expected.”
   - Best for: clarity and decisiveness.

2. **Empathetic and Reassuring**
   - Ex: “I know this isn't easy to hear, and I want to walk you through what this means.”
   - Best for: trust and emotional awareness.

3. **Solution-Oriented**
   - Ex: “This didn't go as planned, but here are a few ways we can move forward.”
   - Best for: momentum and problem-solving.

4. **Gradual and Detailed**
   - Ex: “Let's review what happened step by step so everything is clear.”
   - Best for: complex situations and transparency.

5. **Context-Sensitive**
   - Ex: “This is important enough that I'd prefer to discuss it at the right time or in the right setting.”
   - Best for: high-stakes or sensitive conversations.

Actions: **Cancel** | **Save** (purple).

---

## Handling Objections (modal)

**Modal title:** Handling Objections  

**Question:** “How do you usually handle objections or concerns from clients?”

**Options (radio selection):**

1. **Provide Detailed Explanations**
2. **Offer Reassurance and Solutions**
3. **Redirect to Positive Aspects**
4. **Acknowledge and Validate Concerns**
5. **Seek Compromises and Alternatives**

Actions: **Cancel** | **Save** (purple).

---

*Stored for processing later. No code added.*
