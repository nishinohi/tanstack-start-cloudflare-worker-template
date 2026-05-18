---
paths:
  - "apps/web/src/**/*.{css}"
  - "packages/**/*.{css}"
---

# Draft: CSS Code Review Checklist

- This is a work in progress and will be expanded over time.
- This is for my personal use and is not intended to dictate how others should conduct reviews.
- I may make this private once it's more complete.

## Mindset

- When pointing out issues, always include both the "reason" and the "solution" ("This code is wrong" alone does not constitute a review).
- `[MUST]` should primarily address: violations of specifications or coding standards / actual bugs / issues likely to become serious problems in the future / things that impede usability or accessibility. Secondary priority goes to "things that should be improved."
- Don't be dogmatic. Comments that are unlikely to benefit users or clients, or that don't contribute to profitability—essentially personal preferences—should be labeled as `IMO` or shared elsewhere.
  - I regularly share my thoughts on distinguishing between flex and grid, but in reviews, I generally don't comment if the behavior works correctly.
  - I use multi-keyword syntax for `display`, but since it doesn't enable anything special, I don't force it on others. In practice, I sometimes prioritize the single-keyword syntax that others are more familiar with.
    - My reasons for using multi-keyword syntax are that it makes normal flow explicit (e.g., `display: block flow`), and it's easier to explain layout mechanisms to others using multi-keyword syntax.
  - I've seen negative opinions about using logical properties like `margin-inline` "as a shorthand for left-right," but I'm permissive about this.
    - As a premise, major layout methods—normal flow, flex, grid, container queries—are built on logical specifications. In flex, the main axis changes with vertical writing (`writing-mode: vertical-lr`), and in `grid-template`, cell order reverses in RTL environments. Meanwhile, media queries, `transform`, `background-position`, etc., only have physical specifications. In this mixed environment of physical and logical foundations, debating physical vs. logical for just `margin` and `padding` is meaningless.
    - It feels inconsistent that calling `justify-content: flex-end` "right-align" was never problematic, yet logical properties for `margin` and `padding` suddenly receive strong criticism. `justify-content` has physical values like `right`, but I've never seen them used. If you're going to be particular about physical vs. logical, shouldn't you address that too?
    - Usage like `margin-inline: auto` produces the same result in RTL environments, making it unlikely to cause problems. Vertical writing only occurs for design purposes, so it's not a consideration. If it can prevent potential bugs from unnecessarily overwriting block-axis `margin`, adopting it is worthwhile despite some conceptual differences.
    - Note that in my own published code, I prioritize logical properties like using `inset-block-start` instead of `top`. However, this is less about multilingual support and more about my personal preference for consistency with major layout methods—I don't intend to force this on others. In practice, I sometimes prioritize physical properties that others are more familiar with.
    - Even Tailwind, which involves many CSS experts, replaced `mx` with `margin-inline` and `py` with `padding-block` starting in v4.[https://tailwindcss.com/docs/margin]

- For unclear code, add `[Q]` and comment as a question.
- Recognize that once CSS passes review, the reviewer shares responsibility for it.

## Does It Follow Specifications and Coding Guidelines?

- If the project has coding guidelines, verifying compliance is the top priority.
- Design tokens for typography, color palette, borders, elevation, animation easing, etc., should be stored as custom properties in files organized by category in a `tokens` directory (equivalent to `setting` in Sass-based CSS methodologies). Encourage using these tokens.
  - The `tokens` directory serves as a design guide that CSS can reference.
  - However, I don't nitpick about spacing tokens. Due to the nature of static mockups, design tokens are typically defined in `px` or `rem`. However, in responsive environments, spacing often involves `%` or `cqi`, and considering `<meta name="text-scale" />`, even `px` vs. `rem` requires case-by-case decisions—it's not a simple either/or.
    - [Tailwind's creator also regrets implementing unit-based spacing design](https://x.com/adamwathan/status/2003638134840656373?s=20).
    - If you do set up spacing tokens, define them as pixel-equivalent numbers and convert to each unit using `calc()`.
- If you see something like `line-height: 1.8`, point out that they should use the defined token if one exists. If it's a one-off value not defined in design tokens, recommend hard-coding it rather than adding it to tokens.

## Are Indentation and Property Order Consistent?

- Ideally, this formatting is the job of formatters/linters, not something humans should manually adjust. However, if automation isn't working for some reason, point it out.
- What matters is that indentation and property order are "consistent"—the specific method is fine as long as the project agrees on it.
  - I've published my own stylelint order rules on npm: [https://github.com/tak-dcxi/taks-stylelint-order](https://github.com/tak-dcxi/taks-stylelint-order)

## Does It Meet the Project's Browser Support Requirements?

- For example, if the requirement is "Safari must support the two major versions prior to the latest," verify that CSS unsupported in Safari 17.6 isn't being used.
- However, if it can be used within progressive enhancement and hasn't caused issues in QA, don't flag it.
  - Suitable for progressive enhancement:
    - Features that display normally in unsupported environments or have easy fallbacks, while providing better experiences in supported environments.
    - Examples: View Transition API, `text-wrap: pretty`, `word-break: auto-phrase`, `::details-content` for animation purposes, `field-sizing`, etc.
    - I consider `text-box-trim` for removing half-leading within progressive enhancement scope as long as it doesn't break layouts or significantly alter appearance in unsupported environments.
  - Not suitable for progressive enhancement:
    - At-rules likely to be ignored entirely in unsupported environments, or layout features prone to significant display issues.
    - Examples: style queries, Anchor Positioning, `place-self` for `position: absolute / fixed`, `sibling-index()` / `sibling-count()` functions, etc.
- Also watch for "new specifications for existing properties" that Chrome tends to implement early. Testing only in the latest Chrome may lead to unintended discrepancies.
  - `justify-items` / `justify-self` can be used in block layout, but currently only in Chrome. When rolling back from `grid` to `block` at breakpoints, verify that `justify-items` / `justify-self` definitions aren't left behind.
  - "Unit-based division" like `calc(40px / 1280px * 100vw)` is called typed arithmetic and is gaining browser support.
    - However, Firefox doesn't support it yet, and Safari only supports it from 18.2 onward, making it difficult to use. Avoid it.
    - I've seen beginners accidentally use this in accumulating posts, so pay special attention in reviews.
  - Starting with Chrome 145, `vw` calculates without including the scrollbar under certain conditions: [https://x.com/tak_dcxi/status/2012336570293248061](https://x.com/tak_dcxi/status/2012336570293248061).
    - However, Safari/Firefox still behave traditionally, potentially causing horizontal scroll, so avoid `width: 100vw`.
    - In most cases, `width: 100vw` is "unnecessary" or "replaceable with alternatives." Even if all core browsers eventually calculate without the scrollbar, it's still worth flagging to reduce code smell. Moreover, `vw` itself is a risky unit since Chrome doesn't zoom it, so use it sparingly.

## Are Naming Conventions Consistent? Is There Collision Risk?

- Verify that class and custom property naming is consistent.
  - Are kebab-case, snake_case, and camelCase mixed?
  - Are BEM and other naming conventions mixed?
- Verify that generic element names like `.title` are scoped by Scoped CSS.
- For API-like custom properties that manipulate component values, recommend using prefixes like `--component-name--foreground` instead of generic names like `--foreground` to prevent collisions and make it clear "which component this belongs to" when different API-like custom properties coexist.
- Since `@keyframes` is always globally defined, recommend prefixing component-specific animations similarly to prevent collisions.
  - This gets dogmatic, so I don't mention it in reviews, but recently I've been suggesting adding `--` to "user-named identifiers" like `@keyframes`.
    - Recent CSS trends toward forcing `--` to clearly distinguish user-defined names (e.g., `anchor-name`, `animation-timeline`).
    - Reduces the need to remember "does this property require `--`?" for each case.
    - Reduces collision risk even if CSS adds new standard keywords in the future.
    - Makes it immediately clear that a name is user-defined.
  - However, this applies to names used as values; things like `@layer` that don't relate to values don't need it.

## Are There Unnecessary Declarations or Overrides?

- The more unnecessary declarations there are, the more context-dependent it becomes when conflicting with other selectors (base CSS / layout primitives / other rules within components), leading to more cases where things don't work as expected.
- Unnecessary declarations can trigger specificity battles to override them, increasing maintenance costs.
- Writing CSS with a "let me just try adding this" approach means design decisions aren't shared, leading to implementations that can't be reproduced. Ensure you can explain "why this is necessary" for each declaration.

### Is `width: 100%` / `height: 100%` Applied to Everything?

- A particularly common pattern is "just throwing in `width: 100%`."
- In principle, elements that have `display: block` applied via UA stylesheet (like `<div>` or `<p>`) naturally follow the parent element's width with the initial value (`auto`), so `width: 100%` is unnecessary in most cases.
- Elements with `position: absolute` / `fixed` expand to fill available width when `inset: 0` is specified (except for replaced elements, etc.), so there's generally no need to add `width: 100%` except for elements like `<img>`.
- `height: 100%` only works as expected when "the parent element's height is explicitly defined" due to infinite loop prevention. Suggested values like `min-height` don't work.
  - As mentioned later, explicit height specifications themselves can be anti-patterns, so avoid careless `height` fixes.
  - Flex/grid items can fill height via stretch without writing `height: 100%`, making it often unnecessary.
- `width: 100%` / `height: 100%` aren't just meaningless—they can trigger unintended bugs due to browser differences.
  - Past examples: In Safari, `width: 100%` on child elements of `<summary>` with active `list-style-type` causes unnatural line breaks; in Firefox, `height: 100%` on subgrid elements can cause unnatural compression.
  - There's also overflow risk when rolling back `box-sizing` to initial value (e.g., when setting `max-width` without including `padding`) or when horizontal margins are unintentionally applied.
- Use `width: 100%` only for "targets with clear necessity," such as replaced elements that don't naturally expand even with `display: block` (e.g., `<img>`) or form parts (e.g., `<button>`).
  - When applying `width: 100%` to elements with `inline` outer display type like `inline-block` or `inline-flex`, consider changing to `block` outer display type. This also prevents the bottom gap caused by `vertical-align`'s initial value `baseline`.
- If you just want to match children to parent height, simply applying `display: grid` to the parent often achieves this through `stretch`.
  - This method works with `min-height` too, making it easier to avoid the "fixed height" anti-pattern.
- When using Tailwind, check if `w-full` / `h-full` is applied to everything. AI-generated output particularly tends to overuse these.
- `100%` as a fallback like `width: min(320px, 100%)` is fine. However, watch out for horizontal margins in this case.
  - Generally, explicit horizontal spacing should be handled with parent's `padding`.

### Are Shorthand Properties with Side Effects Being Overused?

- While shorthand is convenient, note that longhand settings can be unintentionally reset by later shorthand declarations.
- Example: `background: white` can reset not just `background-color` but other background sub-properties to defaults. This can break background images, sizes, etc., set elsewhere, leading to accidents.
- Many people learn `margin: 0 auto` / `margin: auto` for horizontal centering, but these are equivalent to overwriting "top and bottom margins that don't need to be touched" to `0` / `auto`.
  - This particularly conflicts with flow layout introduced in Every Layout, canceling out the intended `margin` from flow.
  - As an alternative, suggest `margin-inline: auto` which only centers the inline axis.
- Also watch for shorthand like `flex` where initial values map to different values. I've seen posts like "I don't know what's 1 in `flex: 1`, so I'll use `flex-grow: 1`," but `flex: 1` sets `flex-basis` to 0, so they're different.
- Not all shorthand is problematic.
  - Properties like `inset` or `border` that "apply arbitrary values to all sides" rarely cause issues.
  - Even `background` mentioned above is unlikely to cause problems in scenarios where settings being injected is unlikely, like pseudo-elements.
  - Focus flags on properties with broad impact, involving inheritance or complex default values, that look suspicious in implementation.
- `font` in particular is the worst property—recommend not using it except for reset purposes.

### Are Default Values Being Unnecessarily Re-specified?

- "Default" here collectively refers to CSS initial values / UA stylesheet values / reset CSS values / base CSS values.
- Example: Check if things like `margin: 0` or `display: block` on `<div>` are being written ad-hoc. If the intent is unclear, it's often a sign of inconsistent design.
  - If the goal is "remove top margin only on the first element," suggest using `:not(:first-child)` or owl selector to "not apply `margin` only to the first element."
- When rolling back values to default at breakpoints, recommend using `unset` / `initial` / `revert` / `revert-layer` as IMO to clarify which level you want to return to.
  - However, since the CSS initial value of `display` is uniformly `inline` regardless of whether it's `<div>` or `<p>`, this requires foundational knowledge, so adjust feedback intensity based on reviewee's proficiency.
- Base typography defined on `:root` / `body` should use inheritance as a rule. Minimize local re-specification.

## Check for "Heavy Declarations" in Global CSS

- "Heavy declarations" here doesn't mean performance-heavy, but rather declarations with broad impact that tend to degrade maintainability.

### Is Base CSS Specificity Minimized?

- High specificity type selectors in the base layer make later overrides difficult and prone to breakdown.
- For example, the base layer might contain:

```css
  a:link,
  a:visited {
    color: var(--foreground-link);
  }
```

- The problem is high specificity. `a` (type selector) + `:link` / `:visited` (pseudo-class) gives specificity of 0.1.1, which a single class can't override.
  - This leads to meaningless selector combinations to increase specificity just to change link color, or worst case, adding `!important`, degrading maintainability.
- For new projects, first consider introducing cascade layers (`@layer`).
  - With clear layer design, specificity battles are less likely even with selectors like above.
- If cascade layers are difficult to introduce, recommend wrapping base type selectors in `:where()` to reduce specificity to 0.

```css
  :where(a:any-link) {
    color: var(--foreground-link);
  }
```

- However, `:where()` has pitfalls: if third-party reset CSS (e.g., destyle.css) doesn't use `:where()` and type selector specificity remains, the reset takes priority and can cancel base definitions. Therefore, choose reset CSS with specificity reduced via `:where()` like kiso.css whenever possible.

### Are Destructive Properties Specified in Base CSS?

- Properties involved in layout like `display` / `position` / `margin` are very sensitive and more destructive than color or typography properties.
- As an extreme example, you can understand why these approaches are clearly dangerous:
  - Applying `display: flex` to all `div` because flex is used frequently
  - Applying `position: relative` to universal selector because specifying relative parent for `position: absolute` is tedious
- While I haven't seen implementations quite that extreme, in practice, things like the following can sneak in:
  - Making all `a` elements `inline-block`
  - Specifying `max-width` on `p`
- What to define (or not) for layout properties varies by context. If layout definitions exist in base styles, there's high risk of frequent `unset` / `revert` in different contexts or unintended bugs.
- After establishing minimum assumptions in reset CSS, only carefully define layout properties when further flattening is needed. Communicate to avoid unusual base definitions.

### Are There Accessibility-Impairing Declarations?

- A typical example is `outline: none` on links and interactive elements. Removing outline makes focus position invisible during keyboard navigation, impairing accessibility—an anti-pattern.
  - In recent UA stylesheets, focus rings are mainly shown only on `:focus-visible`, so outlines appearing constantly on click are basically unlikely now.
- The approach of setting default `line-height` to `1` "because it makes coding easier" is also an anti-pattern.
  - Even if the design shows one line, line breaks can occur due to content changes, responsiveness, machine translation, etc. Depending on the font, lines may overlap and become unreadable.
  - For base, recommend specifying `line-height: 1.5` or higher from an accessibility perspective and letting it inherit.
    - Even if `line-height: 1` is absolutely necessary somewhere in the design, alternatives exist like `text-box-trim` or calculating half-leading with `calc((1lh - 1em) / 2)`.
- Also verify that `color-scheme: light dark` isn't set when dark mode isn't supported.
  - If background or text color specifications are insufficient, system colors apply in dark mode, potentially causing text and background to blend together.
  - This might come from foreign reset CSS or frameworks, but if dark mode isn't supported, point out to remove `color-scheme: light dark`.
  - For dark-background sites, setting `<meta name="color-scheme" content="dark">` is good. Scrollbars etc. also become dark regardless of user's appearance mode, improving experience consistency.
  - For light-background sites, not specifying anything for `color-scheme` is fine.

## Check for Defensive CSS

- Except for short-term LPs that end after one release, typical websites undergo continuous updates and revisions. Especially in CMS projects, irregular content changes can occur at client discretion. With this in mind, verify whether the CSS is **defensive**.
- When writing CSS, always ask "What if...?" For example, "What if the text is twice as long?" "What if the image doesn't exist?" Build in unexpected patterns from the design/development stage.

### Can It Handle Content Variations?

- Fixed `width` values tend to cause overflow and don't work well with responsiveness, so avoid them in principle.
  - If `max-width` achieves the goal, adopt that first.
  - If you want to "fit to content width," consider `width: fit-content`.
  - Allow fixed `width` only for graphical elements like icons, checkboxes, and small decorations.
- Pay attention to all "width specifications" prone to overflow.
  - `grid-template-columns: repeat(auto-fit, minmax(360px, 1fr))` is commonly written, but overflows if parent width falls below `360px`. Use `grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr))` to provide `100%` as fallback with `min()`.
  - `min-width: 320px` similarly overflows below `320px`. Don't forget the fallback: `min-width: min(320px, 100%)`.
  - In `flex`, watch for `flex-shrink: 0` overuse. It's particularly common when trying to "prevent text from breaking awkwardly," so first suggest whether `min-width: fit-content` can solve it.
    - However, verify that `flex-shrink: 0` is applied to elements like icons that shouldn't shrink.
    - Note that `width: 320px` on flex items is referenced as `flex-basis`, so it's treated as a "recommended value" rather than fixed. Unless `flex-shrink: 0` is specified, fallback like `min(320px, 100%)` isn't needed.
    - The difference between `width` and `flex-basis` is "which holds the main axis base size." `width: 320px` is "horizontal width" regardless of `flex-direction`, but `flex-basis: 320px` becomes "height" with `flex-direction: column`. Be careful when switching `flex-direction` at breakpoints.
    - Width priority order: `min-width` > `max-width` > `flex-basis` > `width` (strongest to weakest).
- Fixed `height` values are also weak against content and responsive variations, so avoid in principle.
  - If `padding` can reproduce the intent, `height` specifications are unnecessary.
  - For full-screen hero headers where height is clearly needed, use `min-height`.
  - For graphical elements with fixed aspect ratios or boxes requiring square/circle shapes, use `aspect-ratio` to maintain ratio while following one dimension's size.
  - Use `height` as a last resort only when these can't reproduce the intent.
- In `flex` where element count may change, verify `flex-wrap: wrap` is applied.
- When applying `aspect-ratio` or `height: 100%` to images, verify `object-fit: cover` is applied so different-ratio images don't stretch.
  - The `object-fit` initial value `fill` is almost never desirable. Basically choose between `cover` and `contain`. Applying `object-fit: cover` uniformly to `<img>` in base and overriding only where `contain` is needed is also an option.
- For line breaks, don't apply `white-space: nowrap` unless there's a clear "unavoidable reason." Also verify appropriate `line-height` is set so readability is maintained when breaks occur.
  - As mentioned, `line-height: 1` is not acceptable.
  - Line breaks also affect readability and aesthetics, so [refer to separately compiled content for details](https://gist.github.com/tak-dcxi/0f8b924d6dd81aaeb58dc2e287f2ab3a).

### Can It Handle the Unexpected?

- In layouts with text over images, if the image doesn't load, background and text may blend. Verify a fallback background color with sufficient contrast against text color is prepared.
- In flex/grid items, if text contains long words, or includes text `<input>` or horizontally scrolling `<table>`, test for overflow breaking through the frame.
  - While `min-width`'s initial value `auto` is generally treated as equivalent to `0`, in flex/grid items it maps to `min-content` (a rule preventing shrinking below the element's minimum size).
  - Text wrapping issues can be solved by specifying `overflow-wrap: anywhere` on `:root`. Not needed if using kiso.css.
  - However, for `<input>` with browser-set minimum sizes or `<table>` with horizontal scroll, overflow can still occur.
  - Suggest specifying `min-inline-size: 0` on the universal selector. While we can't say there are absolutely no side effects, **it's simpler and more rational to fix the visible problem of "shrinking too much" than to struggle with the counter-intuitive problem of "overflowing for some reason" by default**.
  - In existing service modifications, bugs from this `min-content` origin regularly occur. If so, it's better to specify defensively by default.
  - [Tailwind's creator also recommends this approach](https://x.com/adamwathan/status/1734696245015494711?s=20)

## Check for Component Design Issues

- Each component should always aim to "know nothing outside itself."
- From a CSS design perspective, components should be resilient enough not to break when drag-and-dropped to unrelated places (e.g., footer).

### Is Component Abstraction Being Over-Pursued?

- In the Monster Hunter series I play, Rathalos exists as an iconic monster.
- Besides the original species, Rathalos has subspecies / rare species / deviant species / tempered / apex variants, etc. Though they may look like color swaps, their attack patterns / elemental weaknesses / habitats / drop materials, and the weapons/armor you can craft are completely different.
- A common mistake is grouping these variants as "variations" and defining them as a single "Rathalos" block. Treating different things as one block can't maintain functional identity, leading to unnecessary branching that makes the block complex and bloated, harder to maintain. Furthermore, even if rare species or apex become unnecessary later, they're hard to discard.
- In web terms, cards are similar. Even if they look alike, "product cards" and "article cards" have different roles and contained content. Grouping them as "card" can cause the same tragedy.
- Don't unify based solely on "appearance" or "general category"—add whether they're functionally identical as a criterion. Abstraction makes batch changes easier but also changes things you don't want to change together. Accept some abstraction limits and aim for designs where unnecessary parts can be discarded.
- Programming languages have the DRY principle that discourages repeating the same thing, but CSS is not a programming language. For example, [ECSS](https://qiita.com/manabuyasuda/items/37523e9d0bfbad34211f) deliberately allows duplication to curb complexity.
- If you want to unify card appearances, prepare tokens like `--card-background` and apply them to each card component. This makes it easy to handle requests like "change all card backgrounds to this."

### Are "External-Related Layouts" Specified on Component Roots?

- "External-related layout" is my coined term, but I think layout specifications include "internal-related layouts" that complete with just the element's own styles (like `padding` or `grid-template`), and "external-related layouts" that depend on relationships with external elements.
- Examples of properties that can be external-related layouts:
  - `margin` is external-related since it depends on surrounding relationships. This is why "don't put `margin` on components" is often said.
  - `position: absolute` depends on a relative parent to work. Additionally, `inset` defines distance from the relative parent, making it external-related.
  - Properties that work with parent specifications: `flex` / `grid-area` / `justify-self` / `align-self`, etc.
  - If the component itself holds `width` / `height`, versatility decreases, and in most cases the parent should control these, so treat them as external-related in principle.
  - `min-width` / `max-width` can change nature by context. If there's a component-specific rule like "this component needs at least this size" or "must not expand beyond this," it's internal-related. But if determined by parent relationship like "max 50% of parent element," it's external-related.
  - `subgrid` is "internal-related" while also having "external-related" nature since it assumes the parent is `grid`. Cards using `subgrid` should include the element specifying the `grid` container as part of the component.
- However, there are exceptions:
  - Elements applying `position: fixed` like modals are viewport-based, and since they clearly belong to the viewport, allowing external-related layout on the component side is acceptable (there are also circumstances making it hard to manipulate from the viewport level).
  - Elements applying `position: sticky` like global headers can hold `inset` on the component if the sticky target is the viewport. However, if the sticky target is a specific box like a table header, don't hold it on the component (though componentizing table headers is rare anyway).
  - Small graphical elements like icons or checkboxes need to hold their own size, making them internal-related. In this case, specify something like `width: 1em` so parent `font-size` can control it.

### Check That Other Component Selectors Aren't Included

- When overriding child component styles from parent components, avoid directly manipulating child component selectors. This easily leads to specificity battles, gets dragged by child component structural changes, and requires parent-side definition fixes—major side effects.
- There are multiple options for overriding child components like adding Modifiers, but I primarily consider **preparing API-like custom properties on child components**.
- Example: Want to change child component's child element's `border-radius` from `12px` to `24px`
  - Child component side: Replace the override target with `border-radius: var(--component-name--radius, 12px)`.
  - Parent component side: Define `--component-name--radius: 24px` at any location.
  - This safely swaps child component appearance using inheritance.
- Benefits of using API-like custom properties:
  - Going through custom properties separates specificity, avoiding specificity battles.
  - Parent components don't need to know where API-like custom properties are used within child components. Even if child component structure changes, parent side basically needs no changes.
  - Child components don't need to know where API-like custom properties are defined on parent side. Any place that can pass through inheritance—parent root, wrapper, or even child's `style` attribute—works.
    - `style` attributes have high priority and are often avoided, but viewed as injection points for API-like custom properties, they can be used safely and effectively.
  - In Shadow DOM or Scoped CSS, they can be easily passed as long as inheritance works.
  - Good compatibility with future style queries.
- For collision prevention and identifiability, use prefixes like `--component-name--foreground` rather than generic names like `--foreground` for API-like custom properties.
- This technique is important not just for new projects but also for modifying existing services (especially CSS with broken specificity), so keep it in mind.

### Handling z-index

- Specify only "absolute `z-index`" on component roots, and specify only "relative `z-index`" on elements inside components.
- Don't allow relative `z-index` values other than `1` or `-1`. For stricter control, you can prohibit anything except via custom properties as in the presentation materials.
- For components with relative `z-index`, verify that `isolation: isolate` is specified on the component root to create a stacking context, ensuring `z-index` is scoped.
  - Missing this can cause unintended side effects by interfering with other components' `z-index`.
- Even for top-layer elements like `<dialog>`, I currently recommend specifying `z-index: calc(infinity)`.
  - `transition-property: overlay` is currently Chrome-only, and in unsupported environments like Safari, during close animations, elements may slip behind higher `z-index` elements, causing unnatural behavior.
