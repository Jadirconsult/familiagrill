---
target: landing page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-16T23-12-11Z
slug: src-pages-landing-tsx
---
Method: dual-agent (A: a01d7bba design review · B: a0c6d008 detector + static evidence)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Night Meter exemplary but hero-only; Order section shows both cards lit at 01:50 though the order window closed 01:45 |
| 2 | Match system / real world | 2 | "Reserve sua Mesa" is the customer's intent labelling a staff-login link; one destination has three names |
| 3 | User control and freedom | 3 | Esc closes menu, tabs reversible; form wipes on success without review; ~12 external links unannounced |
| 4 | Consistency and standards | 3 | APG tabs correct, token discipline strong; eyebrow contract broken exactly once, at the highest-stakes element |
| 5 | Error prevention | 3 | BR masks, 31/02 check, 90-day cap, hours mirrored in DB; undermined by the blockers logic bug |
| 6 | Recognition rather than recall | 2 | "Confira os horários acima" is two screens up; date format lives only in a 2.43:1 placeholder |
| 7 | Flexibility and efficiency | 3 | Sticky header CTA serves returning customers; nothing beyond |
| 8 | Aesthetic and minimalist | 3 | Strongest axis; Hours restates the Night Meter at three times the length |
| 9 | Error recovery | 2 | Plain copy with a real escape, but the failure message is 4.23:1 at 12px and the blocker is not in a live region |
| 10 | Help and documentation | 3 | WhatsApp as the human channel, three times, is the right answer |
| **Total** | | **27/40** | **Acceptable - significant improvements needed** |

No heuristics scored n/a: 7 and 10 genuinely apply (PRODUCT.md names returning customers as an audience; WhatsApp is a real help channel).

## Design specificity verdict

Authored, top-decile specificity - but it lives entirely in type, colour and prose, and none of it reads as food. The Night Meter is a data model of this house's two overlapping shifts, not a styled component. The temperature scale is taxonomy enforced in code. Where it goes generic: the Order two-card split, map-beside-form, footer. The deeper limit: a restaurant page asks a hungry visitor at 23:40 to salivate over prose on #121110. Nothing on the first screen looks edible. That is content debt, not a design flaw - but it is the ceiling on everything else here.

Deterministic scan: detector clean (empty array, exit 0) but DEGRADED - htmlparser2, css-select, css-tree and domutils are absent from node_modules, so it fell back to regex; custom properties, selectors and computed contrast were not evaluated. The empty result is an undercount, not a clean bill of health. Every finding below came from source reading and manual WCAG computation.

Browser overlay: none. No browser automation in this session. Size and spacing judgments are computed from the Tailwind classes, not observed in pixels.

## Overall impression

The craft floor is high and the failures are structural, not sloppy. It is a brand page dressed as a conversion page: what it does best (atmosphere, live instrument, taxonomy) is not what it needs to do (drive the order). The biggest single opportunity is not aesthetic - the path to the primary action is broken in two places, one of them literal.

## Cognitive load: 5 of 8 fail (high, critical band)

Fail: single focus, chunking, visual hierarchy (category at 36px beats product at 20px), minimal choices (Visit presents seven simultaneous affordances), working memory. Pass: grouping, one-thing-at-a-time, progressive disclosure.

## What's working

1. The Night Meter is authorship, not styling - it models two different kinds of shift that overlap, one crossing midnight, with true proportional hour marks, a 30s refresh, a full sr-only reading per track, and a filled/hollow glyph so the open state is never carried by colour alone.
2. Colour carries taxonomy, enforced in code (heat: ember | flare | cold). The visitor learns the code once in Kitchens and reads the rest of the page faster without being told.
3. The content model and the design are the same decision - primaryChannel drives three CTAs at once, hours is derived from dineInService rather than copied, and the migration repeats the same window in the database.

## Priority issues

### [P0] The primary CTA leads nowhere

site.ts:48 and :55 point at 99food.com/ and ifood.com.br/ - the apps' national homepages, not the store pages. It is a documented TODO, but it is what happens today: the gold button lands on a generic home with no restaurant in sight. This is the page's success metric, and it is P0 by definition - task completion is prevented. Fix: obtain the direct store URLs. Until they arrive, WhatsApp is the only channel that works end to end and may deserve hero promotion.
Command: $impeccable clarify

### [P0] Five screens with no path to the action, and the Order section does not know what time it is

The primary CTA appears at ~600px and does not reappear until ~3,300px on a 390px phone. Kitchens (~1,480px, zero links) and Menu (~1,060px, ending on a hairline with no action) sit between them. The header CTA truncates to the bare verb "Pedir" (Header.tsx:93) - and the arithmetic shows the full label fits: Space Mono has a 0.6em advance, so the label at 11px with tracking measures ~143px against ~172px available at 320px. The truncation was an over-cautious call and it cost the persistent CTA its object. Separately, the Order section renders both cards identically at 01:50 though services[0].close is 01:45. Fix: restore the full label; close the Menu section with an order action; feed statusOfAll() into Order.tsx so a closed window says so at the point of decision; give the footer a final ask, since peak-end is currently spent on administration.
Command: $impeccable layout

### [P1] The reservation form is silent to assistive tech and hides what is missing

In Visit.tsx, blockers returns early with a reason while missing may still be non-empty, and line 281 lets reason win - a past date with an empty name shows only the date error, and the form then appears to invent new requirements once the date is fixed. The blocker message is a plain paragraph with no live region, and the submit button is absent from the DOM until the form is valid, so a screen-reader user tabs off the last field into nothing. No aria-required on any mandatory field. Fix: render reason and missing together; wrap the blocker in role="status" aria-live="polite"; keep a disabled submit in the DOM with aria-describedby pointing at the blocker text.
Command: $impeccable harden

### [P1] "Reserve sua Mesa" is a staff door wearing the customer's words

Visit.tsx:198-205. The visible text is the customer's exact intent; the accessible name is "Painel da equipe: consultar reservas (acesso restrito)". That is a WCAG 2.5.3 Label in Name failure - voice control finds no target. It also occupies the eyebrow slot, which is a static, non-interactive label in all five other sections, and the target is ~14-16px tall against a 44px minimum. Fix: give the staff door a staff label; the eyebrow above the form becomes an inert paragraph reading "Reserva de mesa".
Command: $impeccable clarify

### [P2] Contrast, touch targets, and the system violating its own named rules

Computed WCAG ratios: placeholder smoke/50 on coal is 2.43:1 against 4.5:1 required, and it is the only place the dd/mm/aaaa format is stated; ember on soot is 4.23:1 (the temperature label inside the tab panel, and the reservation failure message); coal at opacity-70 on gold is about 4.0:1 ("Nosso app preferido", on the primary conversion card); smoke/60 on coal is about 3.0:1 (footer copyright). ember on coal passes at 4.60:1 - a margin of 0.10.

Touch targets under 44px: the logo link (40px on mobile), the desktop nav links (~16-20px), "Reserve sua Mesa" (~14-16px), and the form inputs, which have no explicit height floor.

Named rules violated: "um paragrafo nunca e mono" is broken at Hours.tsx:70 and NightMeter.tsx:73, both reading text; "nao centralizar texto" is broken at Visit.tsx:280; text-base at Order.tsx:70 is a fourth body size absent from DESIGN.md, appearing exactly once, on the conversion card.
Command: $impeccable polish

## Persona red flags

Jordan, first-timer from the Instagram bio link: the first 104px of type says the brasa does not go out at midnight, not what is for sale; the address arrives before the offer; three near-equal buttons follow and the strongest names 99Food, an app he has never heard of in a country where iFood is the household name; he finds the app he does own sitting in the outline card labelled "Tambem entregamos por aqui"; he taps the gold card anyway and lands on 99Food's national homepage with no restaurant in sight.

Riley, deliberate stress tester: tabs the empty form and falls off the last field into nothing; a past date with an empty name silently hides two other missing fields; voice control finds no "Reserve sua Mesa"; a throttled connection exposes four sections sitting at opacity: 0 (index.css:136) with no non-JS fallback, so a stalled observer yields an empty page rather than a slow one.

Casey, one thumb on a weak connection: first paint waits on eight Google Font files behind a render-blocking link; Cinzel's fallback is Times New Roman, so every heading including a 40-104px H1 reflows when the real font lands; before that the root div is empty; 479.81 kB of JS ships in a single chunk with no code splitting, so the /reservas panel and the Supabase client travel to every landing visitor.

## Minor observations

- og:type="restaurant" is not a valid Open Graph type, and there is no JSON-LD Restaurant anywhere despite visitors arriving from Maps and Instagram.
- The seven day chips carry one bit of information that the phone already displays.
- Pessoas is type="number" beside two masked fields; the native spinner is the only piece of browser chrome on an otherwise chromeless page.
- "Alguns destaques" is the only unauthored headline on the page, and it sits over the most commercially important content.
- The NightMeter transition-[left] is not covered by prefers-reduced-motion, because the query zeroes animation and this is a transition.
- The mobile nav panel resolves right-5 left-5 against the shell padding box, aligning to the same vertical edge as everything else. Subtle, and correct.

## Questions to consider

1. The house's channel preference is expressed as a fill colour. Does the outline card read as "second choice" or as "not available"?
2. Why does the section whose whole job is to close the sale not know whether the kitchen is taking orders?
3. Kitchens costs ~1,480px of thumb and contains nothing tappable. Who would notice if it vanished tomorrow?
4. The largest words on the page are about atmosphere; the product names are 20px. Is that the right allocation for someone already hungry?
