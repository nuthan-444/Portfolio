Create a new **“Request a Website”** page for my existing website.

### Important

* **Use the current theme, design system, colors, typography, spacing, animations, components, navbar, footer, buttons, cards, and overall visual language already used in the existing website.**
* Do **NOT** create a completely new design system.
* The new page should look like it was originally part of the existing website.
* Reuse existing components wherever possible.
* Maintain the existing responsive behavior and make the page fully responsive on mobile, tablet, and desktop.
* Follow the existing project's coding conventions and component structure.

### Page Purpose

This page allows a potential client to submit a request if they want me to design and develop a website for them.

### Page Name

**Request a Website**

### Hero Section

Create an attractive hero section using the existing website's style.

Heading:
**Have a Website Idea? Let's Build It.**

Supporting text:
**Tell me about your project, requirements, and vision. I'll review your request and get back to you with the next steps.**

Add a subtle existing-style animation/visual treatment if the current website uses animations.

### Project Request Form

Create a clean, professional multi-section form.

#### 1. Personal Information

* Full Name *
* Email Address *
* WhatsApp / Phone Number
* Company / Business Name

#### 2. Website Requirements

**Website Type * **
Use a select/dropdown:

* Business Website
* Portfolio
* E-commerce
* Blog
* Landing Page
* Web Application
* College / Student Project
* Other

**Project Description * **
Large textarea with placeholder:
“Tell me about your website idea, what you want it to do, and what you're looking for.”

**Required Features * **
Use checkboxes or selectable cards:

* User Login / Signup
* Admin Dashboard
* Payment Integration
* Database
* Contact Form
* Booking System
* E-commerce / Shopping Cart
* Search
* Notifications
* API Integration
* Other

#### 3. Design & References

**Do you have an existing website?**

* Yes
* No

If Yes, show:

* Existing Website URL

Add:
**Reference Website URL**
Optional field where the client can provide websites whose design/functionality they like.

Add:
**Upload Design / Files**
Allow optional uploads for:

* Figma designs
* Images
* Logos
* PDFs
* Other project files

#### 4. Budget & Timeline

**Estimated Budget * **
Options:

* Under ₹5,000
* ₹5,000 – ₹10,000
* ₹10,000 – ₹25,000
* ₹25,000 – ₹50,000
* ₹50,000+
* Not Sure

**When do you need it?**
Options:

* ASAP
* Within 1 Week
* 2–4 Weeks
* 1–2 Months
* Flexible

#### 5. Additional Information

**Anything else I should know?**
Optional large textarea.

**Preferred Contact Method**

* Email
* WhatsApp
* Phone Call

### Submit Button

Use the existing primary CTA/button style.

Button text:
**Send Project Request →**

Add a loading state when submitting.

### UX Requirements

* Clearly mark required fields with `*`.
* Provide proper validation.
* Show useful validation messages.
* Validate email format.
* Validate URLs where applicable.
* Prevent submission when required fields are missing.
* Show a loading state during submission.
* Show a success state after successful submission.
* Show an error state if submission fails.
* Do not lose the user's entered data unnecessarily.
* Make the form keyboard accessible.
* Use proper labels instead of relying only on placeholders.
* Ensure good contrast and accessibility.

### Success State

After successful submission, show a polished success message using the existing design:

**Request Sent Successfully!**

“Thanks for sharing your project idea. I'll review the details and get back to you soon.”

Add a button:
**Back to Home**

### Layout

Desktop:

* Hero section at the top.
* Form centered with a comfortable maximum width.
* Organize the form into visually separated sections.
* Use the existing cards, borders, shadows, gradients, or glass effects only if they already exist in the current design.

Mobile:

* Single-column layout.
* Comfortable spacing.
* Touch-friendly inputs and buttons.
* No horizontal scrolling.

### Visual Direction

The page should feel:

* Professional
* Modern
* Premium
* Developer/freelancer oriented
* Clean
* Easy to complete

But **do not introduce unrelated visual styles**. The existing website's theme and design language must remain the source of truth.

### Technical Requirements

Before implementing:

1. Inspect the existing project structure.
2. Identify the current design system and reusable components.
3. Identify the existing navbar, footer, buttons, inputs, cards, typography, colors, animations, and spacing conventions.
4. Reuse those components instead of duplicating them.
5. Add the new page using the project's existing routing approach.
6. Keep the implementation modular and maintainable.
7. Do not modify existing pages unnecessarily.
8. Do not break existing functionality.

Build the complete page, including responsive UI, form validation, states, animations consistent with the existing website, and integration-ready form submission handling.

and add a another page for admin to see the requestes with this datas , and these data shoild store in the database