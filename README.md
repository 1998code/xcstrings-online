<img width="1920" height="1080" alt="hero" src="https://github.com/user-attachments/assets/42953275-7b09-499e-8f58-e288786bbfaf" />

# Localizable Online
### Edit Xcode String Catalog anywhere, anytime.

> Formerly **XCStrings Online**.

Demo: https://xcstrings-online.vercel.app

## Features
- **Import** — drag & drop a `.xcstrings` file anywhere, or use the Upload button
- **Export** — download your edits back out as `Localizable.xcstrings`
- **Inline editing** — edit translations and comments directly in the table
- **Autosave** — changes persist to `localStorage` automatically
- **Add languages** — searchable autosuggest to add any supported locale
- **Translate all** — one-click machine translation into the selected language
- **Search** — filter the table by key, translation, or comment (plus a language search)
- **Sort** — click any column header to sort ascending/descending
- **String Catalog format** — supports both `stringUnit` and plural/device `variations`
- **Analytics** — live counts for keys, languages, translated, and completion
- **Sticky header** — the table header stays put while you scroll
- **Resizable & collapsible** sidebar
- **Light / dark** theme with a system-aware toggle
- **Apple-style UI** — SF-style typography, FontAwesome icons, animated mesh gradient
- **Built-in user guide**

## Sample XCStrings File by Apple
https://github.com/apple/sample-backyard-birds/blob/main/Multiplatform/Localizable.xcstrings

## Roadmap
| Features | Status | Issue ID |
| - | - | - |
| Import | ✅ Done | - |
| Export | ✅ Done | - |
| Edit | ✅ Done | - |
| Auto Save to LocalStorage (Temporary) | ✅ Done | [#1](https://github.com/1998code/xcstrings-online/issues/1) |
| AI Translation | ✅ Done | [#2](https://github.com/1998code/xcstrings-online/issues/2) |
| Live Collaboration | Planning | [#3](https://github.com/1998code/xcstrings-online/issues/3) |

<img width="1391" height="1017" alt="Screenshot" src="https://github.com/user-attachments/assets/e83574d0-bea1-42f0-872f-c335f49421e3" />

## Contribute to this project

First, fork this project and run the development server:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License
MIT

## Reference
https://developer.apple.com/documentation/xcode/localizing-and-varying-text-with-a-string-catalog
Xcode, Swift, and SwiftUI are trademarks of Apple.
