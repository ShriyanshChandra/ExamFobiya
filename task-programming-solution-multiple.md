# Task: Programming Solution Feature With Multiple Solution Support

## Goal

Add a programming solution feature where each book can have multiple separate coding solution blocks.

## User Experience

- Add a `Solutions` button on the existing book card.
- The button should redirect users to that book's programming solutions page.
- Each solution should appear as its own separate block.
- If a book is marked as not having programming solutions, do not show the `Solutions` button on that book card.
- Example:
  - One block for `Check Prime Number`
  - Another block for `Reverse Array`
  - Another block for `Fibonacci Series`

## Book Card Design

- Reuse the existing `BookCard` component.
- Add `Solutions` beside the existing `Questions` and `Syllabus` buttons.
- Keep the card layout consistent across desktop and mobile.
- Only show the `Solutions` button when the book has `hasProgrammingSolution` enabled.

## Solution Page Design

- Show the book title at the top.
- Show book metadata if available.
- Show all programming solutions in order.
- Each solution block should include:
  - Solution title
  - Programming language badge
  - Code area
  - Automatic line numbering
  - Copy code button

## Multiple Solution Display

Each solution should be visually separated:

```txt
Programming Solutions

Block 1
Title: Check Prime Number
Language: C
Line-numbered code

Block 2
Title: Reverse Array
Language: C++
Line-numbered code
```

## Admin Design

In the add/edit book form, add a checkbox:

- Label: `This subject has programming solution`
- Field: `hasProgrammingSolution`
- Existing books should also show this checkbox in edit mode, so the admin can decide whether that subject has programming solutions.
- If the checkbox is unchecked, hide or disable all programming solution controls.
- If the checkbox is unchecked, the book card should not show the `Solutions` button.

The admin should be able to add multiple solutions in two ways:

1. Add one solution at a time.
2. Paste multiple solutions at once and split them into separate editable blocks.

Each editable block should include:

- Solution title input
- Language input or selector
- Code textarea
- Remove solution button
- Optional move up/down controls for ordering

## Paste Multiple Format

Use a simple structured format:

```txt
### Check Prime Number | C
#include <stdio.h>

int main() {
  return 0;
}

### Reverse Array | C++
#include <iostream>
using namespace std;

int main() {
  return 0;
}
```

When the admin clicks `Split into Solution Blocks`, the app should create separate editable blocks from the pasted text.

## Suggested Data Shape

```js
{
  hasProgrammingSolution: true,
  programmingSolutions: [
    {
      title: "Check Prime Number",
      language: "C",
      code: "#include <stdio.h>\n\nint main() {\n  return 0;\n}",
      order: 1
    },
    {
      title: "Reverse Array",
      language: "C++",
      code: "#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}",
      order: 2
    }
  ]
}
```

## Acceptance Criteria

- A book can store multiple programming solutions.
- Add/edit book has a checkbox for whether the subject has programming solutions.
- Existing books can be edited to enable or disable programming solution support.
- The `Solutions` button only appears when `hasProgrammingSolution` is enabled.
- Each solution displays as its own separate block.
- Each block shows title, language, line-numbered code, and copy button.
- Admin can add, edit, remove, and reorder solution blocks.
- Admin can paste multiple solutions and split them into blocks.
- The copy button copies only the code for that block, not line numbers.
- Dark mode remains readable.
