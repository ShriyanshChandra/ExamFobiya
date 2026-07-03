# Task: Programming Solution Feature Without Multiple Solution Support

## Goal

Add a programming solution feature for each book where a book can have one text-based coding solution page.

## User Experience

- Add a `Solutions` button on the existing book card.
- The button should redirect users to that book's programming solution page.
- The solution should be text/code based, not PDF based.
- If a book is marked as not having a programming solution, do not show the `Solutions` button on that book card.

## Book Card Design

- Reuse the existing `BookCard` component.
- Add `Solutions` beside the existing `Questions` and `Syllabus` buttons.
- Keep the button size, spacing, and responsive behavior consistent with the existing card design.
- Use a distinct accent color for `Solutions`, such as green or teal.
- Only show the `Solutions` button when the book has `hasProgrammingSolution` enabled.

## Solution Page Design

- Show the book title at the top.
- Show book metadata if available, such as category, semester, or section.
- Show one programming solution block.
- The block should include:
  - Solution title
  - Programming language badge
  - Code area
  - Automatic line numbering
  - Copy code button

## Admin Design

- In the add/edit book form, add a checkbox:
  - Label: `This subject has programming solution`
  - Field: `hasProgrammingSolution`
- Existing books should also show this checkbox in edit mode, so the admin can decide whether that subject has programming solutions.
- If the checkbox is unchecked, hide or disable the solution title, language, and code fields in the admin form.
- If the checkbox is unchecked, the book card should not show the `Solutions` button.
- In the add/edit book form, add fields for:
  - Solution title
  - Programming language
  - Solution code
- The admin should not manually type line numbers.
- Line numbers should be generated automatically by the app while displaying the solution.

## Suggested Data Shape

```js
{
  hasProgrammingSolution: true,
  programmingSolution: {
    title: "Check Prime Number",
    language: "C",
    code: "#include <stdio.h>\n\nint main() {\n  return 0;\n}"
  }
}
```

## Acceptance Criteria

- A book can store one programming solution.
- Add/edit book has a checkbox for whether the subject has a programming solution.
- Existing books can be edited to enable or disable programming solution support.
- The `Solutions` button only appears when `hasProgrammingSolution` is enabled.
- The book card can navigate to the solution page.
- The solution page displays the title, language, and code.
- Code is displayed with automatic line numbers.
- The copy button copies only the code, not the line numbers.
- Dark mode remains readable.
