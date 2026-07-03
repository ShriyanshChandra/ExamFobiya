# Task: Programming Solution Feature With Multiple Solution Support

## Goal

हर book के लिए multiple separate coding solution blocks support करना।

## User Experience

- Existing book card पर `Solutions` button add करना।
- Button user को उस book के programming solutions page पर redirect करेगा।
- हर solution अपने separate block में show होगा।
- अगर book में `hasProgrammingSolution` enabled नहीं है, तो उस book card पर `Solutions` button show नहीं होगा।
- Example:
  - एक block `Check Prime Number` के लिए
  - दूसरा block `Reverse Array` के लिए
  - तीसरा block `Fibonacci Series` के लिए

## Book Card Design

- Existing `BookCard` component reuse करना।
- Existing `Questions` और `Syllabus` buttons के साथ `Solutions` button add करना।
- Card layout desktop और mobile दोनों पर consistent रहना चाहिए।
- `Solutions` button सिर्फ तब show होगा जब book में `hasProgrammingSolution` enabled हो।

## Solution Page Design

- Top पर book title show करना।
- अगर available हो तो book metadata show करना।
- सारे programming solutions order में show करना।
- हर solution block में ये चीजें होनी चाहिए:
  - Solution title
  - Programming language badge
  - Code area
  - Automatic line numbering
  - Copy code button

## Multiple Solution Display

हर solution visually separate होना चाहिए:

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

Add/edit book form में एक checkbox add करना:

- Label: `This subject has programming solution`
- Field: `hasProgrammingSolution`
- Existing books के edit mode में भी ये checkbox show होना चाहिए, ताकि admin decide कर सके कि particular subject में programming solutions हैं या नहीं।
- अगर checkbox unchecked है, तो सारे programming solution controls hide या disable कर देने चाहिए।
- अगर checkbox unchecked है, तो book card पर `Solutions` button show नहीं होगा।

Admin multiple solutions दो तरीकों से add कर सकता है:

1. एक-एक solution manually add करना।
2. Multiple solutions एक साथ paste करना और उन्हें separate editable blocks में split करना।

हर editable block में ये fields/controls होने चाहिए:

- Solution title input
- Language input या selector
- Code textarea
- Remove solution button
- Optional move up/down controls ordering के लिए

## Paste Multiple Format

Simple structured format use करना:

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

जब admin `Split into Solution Blocks` click करेगा, app pasted text से separate editable blocks create करेगा।

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

- एक book multiple programming solutions store कर सकती है।
- Add/edit book में checkbox होगा जो बताएगा कि subject में programming solutions हैं या नहीं।
- Existing books में programming solution support enable/disable किया जा सकता है।
- `Solutions` button सिर्फ तब show होगा जब `hasProgrammingSolution` enabled हो।
- हर solution अपने separate block में display होगा।
- हर block title, language, line-numbered code, और copy button show करेगा।
- Admin solution blocks add, edit, remove, और reorder कर सकता है।
- Admin multiple solutions paste करके उन्हें blocks में split कर सकता है।
- Copy button सिर्फ उस block का code copy करेगा, line numbers नहीं।
- Dark mode readable रहना चाहिए।
