# Scope Withdrawal Status

# Build Scope — High-Fidelity Withdrawal Status UI

Create a polished, responsive web application called **Scope**, recreating the layout and visual styling of the supplied reference screenshot as closely as possible.

IMPORTANT: Use the uploaded screenshot as the primary visual reference. Match its dimensions, proportions, spacing, typography, alignment, colors, border radii, and button styling. Do not redesign it into a generic fintech dashboard. Do not add unnecessary navigation bars, sidebars, charts, illustrations, gradients, or decorative elements.

Replace every occurrence of the Deriv brand with **Scope**. Scope must have its own simple wordmark and must not use Deriv's logo or claim to be affiliated with Deriv.

## 1. Technology stack

- React with TypeScript.
- Tailwind CSS for styling.
- Lucide React for icons, only where needed.
- Use reusable, well-structured React components.
- Use semantic HTML and accessible form controls.
- Build a fully responsive page that works on mobile, tablet, and desktop.
- Do not require a backend or database for this demo.

## 2. Exact visual direction and color palette

Use these approximate hex colors sampled visually from the supplied reference. Prioritize matching the screenshot over introducing new colors.

### Page background
- Main background: `#F5F7F9`
- Card background: `#FFFFFF`
- Main card border: `#E0E5EB`
- Main card shadow: `0 14px 35px rgba(30, 45, 60, 0.08)`

### Scope branding
- Wordmark color: `#FF4057`
- Wordmark font weight: 700
- Wordmark font style: italic
- Wordmark font size: approximately 32px
- Letter spacing: approximately -1px

Render the text “scope” as a clean, lowercase, italic wordmark. Do not use an external logo image.

### Withdrawal status banner
- Background: `#FFF7DC`
- Border: `#FFDB70`
- Text: `#B85A00`
- Border radius: 11px
- Height: 50px
- Font size: 16px
- Font weight: 700

Banner text: “Withdrawal Pending”

### Escrow heading
- Heading color: `#159B50`
- Font size: 28px on desktop
- Font weight: 700
- Text alignment: centered
- Text: “ESCROWED AMOUNT”

Subtitle:
- Text: “Pending Amount”
- Color: `#6B7280`
- Font size: 14px
- Font weight: 400

### Details panel
- Background: `#F8F9FA`
- Border: `1px solid #E0E5EB`
- Border radius: 13px
- Padding: 12px
- Width: 100%

Labels:
- Color: `#68778A`
- Font size: 14px
- Font weight: 400

Values:
- Color: `#111827`
- Font size: 14px
- Font weight: 600

Pending status:
- Color: `#F0B400`
- Font size: 14px
- Font weight: 500

Row separators:
- Color: `#E0E5EB`
- Thickness: 1px

### Payment method select
- Background: `#FFFFFF`
- Border: `1px solid #D0D7E0`
- Border radius: 11px
- Height: 45px
- Font size: 14px
- Text color: `#111827`
- Horizontal padding: 10px
- Native dropdown arrow or a clean equivalent
- Focus border: `#159B50`
- Accessible focus ring

Placeholder: “Select a payment method”

### Primary action button
- Background: `#12A650`
- Text: `#FFFFFF`
- Height: 49px
- Width: 100%
- Border radius: 11px
- Font size: 15px
- Font weight: 700
- Text: “Withdraw Payment”

Hover state:
- Background: `#0F9145`

Active state:
- Slightly darker green with a subtle pressed effect.

### Secondary action button
- Background: `#FFFFFF`
- Border: `1px solid #FF3038`
- Text: `#FF3038`
- Height: 51px
- Width: 100%
- Border radius: 11px
- Font size: 15px
- Font weight: 700
- Text: “Cancel Transaction Now”

Hover state:
- Very light red background: `#FFF1F2`

### Footer helper text
- Color: `#667085`
- Font size: 12px
- Line height: 19px
- Text alignment: centered

Text:
“Processing may take a few minutes depending on network availability.”

## 3. Page layout and exact proportions

The page must reproduce the reference's centered, single-card layout.

### Outer page
- Minimum height: `100vh`
- Background: `#F5F7F9`
- Use flexbox to center the card horizontally and vertically whenever the viewport has enough height.
- On desktop, center the card in the available viewport.
- On smaller screens, allow natural vertical scrolling.
- Use approximately 24px of outer padding on mobile.

### Main card
- Desktop width: `410px`
- Maximum width: `410px`
- Width: `100%`
- Background: white
- Border: `1px solid #E0E5EB`
- Border radius: `20px`
- Padding: `32px`
- Box shadow: `0 14px 35px rgba(30, 45, 60, 0.08)`

On a viewport approximately 478px wide, the card should be about 410px wide with approximately 34px of space on each side.

On mobile:
- Width: `100%`
- Maximum width: `410px`
- Padding: `24px`
- Border radius: `18px`
- Avoid horizontal overflow.

### Internal vertical arrangement

Keep all content centered except the details panel rows, which should use left/right alignment.

Follow this exact order:

1. Scope italic wordmark.
2. Withdrawal Pending banner.
3. ESCROWED AMOUNT heading.
4. Pending Amount subtitle.
5. Payment and transaction details panel.
6. Green Withdraw Payment button.
7. Red outlined Cancel Transaction Now button.
8. Small processing disclaimer.

Approximate spacing:
- Wordmark to status banner: 21px.
- Status banner to heading: 24px.
- Heading to subtitle: 8px.
- Subtitle to details panel: 25px.
- Details panel to primary button: 24px.
- Primary button to secondary button: 12px.
- Secondary button to disclaimer: 17px.

The overall desktop card should closely resemble the reference screenshot, approximately 410px wide and 660px tall, depending on font rendering and content.

## 4. Details panel structure

Inside the details panel, create three information rows.

### Row 1: Payment Method
Use a two-column flex layout.

Left column:
- Label: “Payment Method”
- Width: approximately 82px.
- Allow the label to wrap into two lines.

Right column:
- A select element taking the remaining width.
- Default placeholder: “Select a payment method”.

For this demo, provide these options:
- Bank Transfer
- Mobile Money
- Electronic Wallet

Do not ask users for bank account numbers, wallet credentials, passwords, or payment PINs.

### Row 2: Amount
- Left label: “Amount”
- Right value: “AS PROVIDED IN ESCROW”
- Align both vertically and horizontally as in the reference.
- Use a subtle top separator and consistent row padding.

### Row 3: Status
- Left label: “Status”
- Right value: “Pending”
- Color the status value amber.
- Use a subtle top separator.
- Do not display a fabricated monetary balance.

Keep the rows compact and consistent. The panel should resemble the reference rather than a large data table.

## 5. Typography

Use Arial or a metrically similar sans-serif font throughout the interface.

Recommended CSS:

- Body: `font-family: Arial, Helvetica, sans-serif`
- Default body text: 14px
- Primary heading: 28px, weight 700
- Status banner: 16px, weight 700
- Button labels: 15px, weight 700
- Disclaimer: 12px

Maintain the reference's simple typography. Avoid oversized headings, decorative fonts, excessive bold text, and large icons.

## 6. Interaction and demo behavior

Implement functional interactions without representing simulated actions as real financial transactions.

### Payment method selector
- Allow the user to choose a payment method.
- Show the currently selected option.
- Keep the selection visible until changed or the page is reset.

### Withdraw Payment
- If no payment method is selected, display a small inline validation message.
- If a payment method is selected, display a clear modal or inline notice stating that this is a demonstration and no real withdrawal has been initiated.
- Do not connect to a payment processor.
- Do not request deposits, withdrawal fees, passwords, or verification codes.
- Do not display a fabricated successful payment or completed withdrawal.

### Cancel Transaction Now
- Display a confirmation dialog.
- Clearly state that the action is a simulated demonstration.
- Include “Keep Pending” and “Confirm Demo Cancellation” actions.
- On confirmation, change the local demo status to “Cancelled”.
- Do not affect any real transaction or external account.

### Feedback
- Add subtle hover, focus, and active states.
- Prevent accidental double-click behavior during simulated interactions.
- Keep all feedback visually consistent with the design.

## 7. Responsive behavior

Desktop:
- Keep the card centered.
- Preserve the 410px maximum width.
- Maintain the screenshot's spacing and proportions.

Tablet:
- Keep the same centered single-card design.
- Do not introduce a sidebar or multi-column dashboard.

Mobile:
- Use the full available width minus 24px of padding on each side.
- Preserve the vertical content order.
- Reduce the main heading to approximately 24px if necessary.
- Allow the payment selector to shrink without overlapping its label.
- Ensure both buttons remain full-width.
- Avoid horizontal scrolling.
- Keep text readable and controls touch-friendly.

## 8. Code quality

- Create reusable components for the wordmark, status banner, detail rows, payment selector, and action buttons.
- Keep state handling simple and predictable.
- Use TypeScript types for the payment method and demo transaction status.
- Add appropriate accessible labels and keyboard support.
- Use proper contrast for interactive elements.
- Avoid unnecessary dependencies.
- Do not add authentication, a database, real payment processing, or an external financial API.

## 9. Final visual acceptance criteria

Before considering the project complete, compare the rendered page against the supplied screenshot.

Verify that:
- The background is a very light cool gray.
- The white card has a thin gray border, rounded corners, and a subtle shadow.
- The Scope wordmark is italic, bold, lowercase, and coral red.
- The withdrawal banner is pale yellow with amber-brown text.
- The escrow heading is uppercase green.
- The details panel has a light-gray background and three compact rows.
- The payment selector is aligned to the right of its label.
- The primary action is solid green.
- The secondary action is white with a thin red border and red text.
- The disclaimer is small, muted, and centered.
- No extra visual elements distract from the reference.
- The page works on desktop and mobile.
- All buttons behave as documented in demo mode.

Build the complete working interface now. Do not stop at a static mockup or a written plan. Run the application, inspect the rendered result, and refine the spacing and styling until it closely matches the supplied screenshot.

The final result should feel clean, precise, lightweight, and visually faithful to the reference, with Scope branding and clearly simulated transactions.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3e6f80b3-40b9-4979-90d1-386c2ecc3f83).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
