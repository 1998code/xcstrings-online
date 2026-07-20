![image](https://github.com/1998code/xcstrings-online/assets/54872601/676ee304-b9ff-4e71-b88d-a985c57d56b1)

# Localizable Online
### Edit Xcode String Catalog anywhere, anytime.

> Formerly **XCStrings Online**.

Demo: https://xcstrings-online.vercel.app

<img width="1112" alt="Screenshot 2024-04-23 at 10 33 40 PM" src="https://github.com/1998code/xcstrings-online/assets/54872601/741fcb83-dbc4-4bf4-87f8-d4a92c1ca567">

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

## Video Demo
https://x.com/1998design/status/1782763094835356030

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

## Contribute to this project

First, fork this project and run the development server:

```bash
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
