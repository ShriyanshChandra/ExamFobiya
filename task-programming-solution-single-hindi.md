# Task: Programming Solution Feature Without Multiple Solution Support

## Goal

हर book के लिए एक text-based programming solution feature add करना, जिसमें एक book के पास सिर्फ एक coding solution page होगा।

## User Experience

- Existing book card पर `Solutions` button add करना।
- Button user को उस book के programming solution page पर redirect करेगा।
- Solution text/code format में होगा, PDF format में नहीं।
- अगर book में `hasProgrammingSolution` enabled नहीं है, तो उस book card पर `Solutions` button show नहीं होगा।

## Book Card Design

- Existing `BookCard` component reuse करना।
- Existing `Questions` और `Syllabus` buttons के साथ `Solutions` button add करना।
- Button size, spacing, और responsive behavior current card design जैसा ही रहना चाहिए।
- `Solutions` के लिए distinct accent color use कर सकते हैं, जैसे green या teal।
- `Solutions` button सिर्फ तब show होगा जब book में `hasProgrammingSolution` enabled हो।

## Solution Page Design

- Top पर book title show करना।
- अगर available हो तो book metadata show करना, जैसे category, semester, या section।
- एक programming solution block show करना।
- Block में ये चीजें होनी चाहिए:
  - Solution title
  - Programming language badge
  - Code area
  - Automatic line numbering
  - Copy code button

## Admin Design

- Add/edit book form में एक checkbox add करना:
  - Label: `This subject has programming solution`
  - Field: `hasProgrammingSolution`
- Existing books के edit mode में भी ये checkbox show होना चाहिए, ताकि admin decide कर सके कि particular subject में programming solution है या नहीं।
- अगर checkbox unchecked है, तो solution title, language, और code fields hide या disable कर देनी चाहिए।
- अगर checkbox unchecked है, तो book card पर `Solutions` button show नहीं होगा।
- Add/edit book form में fields add करनी हैं:
  - Solution title
  - Programming language
  - Solution code
- Admin को manually line numbers type नहीं करने चाहिए।
- Line numbers app display के time automatically generate करेगा।

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

- एक book एक programming solution store कर सकती है।
- Add/edit book में checkbox होगा जो बताएगा कि subject में programming solution है या नहीं।
- Existing books में programming solution support enable/disable किया जा सकता है।
- `Solutions` button सिर्फ तब show होगा जब `hasProgrammingSolution` enabled हो।
- Book card solution page पर navigate करेगा।
- Solution page title, language, और code display करेगा।
- Code automatic line numbers के साथ display होगा।
- Copy button सिर्फ code copy करेगा, line numbers नहीं।
- Dark mode readable रहना चाहिए।
