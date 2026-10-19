# Native modules: Apple frameworks in Swift

When a piece needs an Apple framework that no Expo package exposes (PDFKit, VisionKit, PencilKit, Swift Charts), wrap it as a **local Expo module**: Swift code inside the app's `modules/` folder, reached from TypeScript through the Expo Modules API. Each module ships three faces:

| File | Platform | Content |
| --- | --- | --- |
| `src/<Name>View.ios.tsx` | iOS | the native view (`requireNativeView`) |
| `src/<Name>View.web.tsx` | web | a browser fallback that works (`<iframe>`, `<input type="file">`, shadcn chart) |
| `src/<Name>View.tsx` | Android and others | a stub that renders an empty view and exports `is<Name>Available = false`, so the piece shows a working fallback, never a crash |

The piece (`src/pieces/PdfViewer/PdfViewer.tsx`) imports the module's entry; Metro picks the right face on each platform.

## Steps

1. From the app root (where `package.json` is): `npx create-expo-module@latest --local`. Name it in kebab case (`pdf-viewer`). It creates `modules/pdf-viewer/` with `ios/`, `android/`, `src/`, `index.ts` and `expo-module.config.json`.
2. For an iOS-only module, keep only Apple in `expo-module.config.json` (`"platforms": ["apple"]`) and delete the generated `android/` folder; the Android face is the JS stub. Compare with the generated file before editing (verify at use).
3. Write the Swift module and view (below). `Name("…")` in Swift is the string TypeScript passes to `requireNativeView`.
4. Write the three TS faces and export them from `modules/pdf-viewer/index.ts`.
5. Rebuild the native app: `npx expo prebuild --clean` when the project has no `ios/` folder (or after config changes), then `npx expo run:ios`. Repeat `npx expo run:ios` after every Swift change; Metro reload does not pick up native code. Expo Go cannot load local modules.
6. Wrap it in a piece (references/pieces.md, Heavy pieces) and use the piece in screens.

## Example: PDF viewer with PDFKit

```swift
// modules/pdf-viewer/ios/PdfViewerModule.swift
import ExpoModulesCore

public class PdfViewerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PdfViewer")

    View(PdfViewerView.self) {
      Events("onLoad", "onError")

      Prop("url") { (view: PdfViewerView, url: URL) in
        view.load(url: url)
      }
    }
  }
}
```

```swift
// modules/pdf-viewer/ios/PdfViewerView.swift
import ExpoModulesCore
import PDFKit

class PdfViewerView: ExpoView {
  private let pdfView = PDFView()
  let onLoad = EventDispatcher()
  let onError = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    pdfView.autoScales = true
    pdfView.displayDirection = .vertical
    addSubview(pdfView)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    pdfView.frame = bounds
  }

  func load(url: URL) {
    guard let document = PDFDocument(url: url) else {
      onError(["message": "Could not open the PDF"])
      return
    }
    pdfView.document = document
    onLoad(["pageCount": document.pageCount])
  }
}
```

`PDFDocument(url:)` reads the file synchronously. Pass a local `file://` URI: download remote PDFs to the cache first with `expo-file-system`, inside the piece, and show the `Spinner` piece meanwhile.

```tsx
// modules/pdf-viewer/src/PdfViewer.types.ts
import type { ViewProps } from 'react-native';

export type PdfViewerViewProps = ViewProps & {
  url: string;
  onLoad?: (event: { nativeEvent: { pageCount: number } }) => void;
  onError?: (event: { nativeEvent: { message: string } }) => void;
};
```

```tsx
// modules/pdf-viewer/src/PdfViewerView.ios.tsx
import { requireNativeView } from 'expo';
import type { PdfViewerViewProps } from './PdfViewer.types';

const NativeView = requireNativeView<PdfViewerViewProps>('PdfViewer');

export const isPdfViewerAvailable = true;

export function PdfViewerView(props: PdfViewerViewProps) {
  return <NativeView {...props} />;
}
```

```tsx
// modules/pdf-viewer/src/PdfViewerView.web.tsx
import type { PdfViewerViewProps } from './PdfViewer.types';

export const isPdfViewerAvailable = true;

export function PdfViewerView({ url, style }: PdfViewerViewProps) {
  return <iframe src={url} title="PDF" style={{ border: 0, width: '100%', height: '100%', ...(style as object) }} />;
}
```

```tsx
// modules/pdf-viewer/src/PdfViewerView.tsx  (Android stub)
import { View } from 'react-native';
import type { PdfViewerViewProps } from './PdfViewer.types';

export const isPdfViewerAvailable = false;

export function PdfViewerView({ style }: PdfViewerViewProps) {
  return <View style={style} />;
}
```

The iOS and web faces export `isPdfViewerAvailable = true`. The `PdfViewer` piece reads the flag and, when it is `false`, renders `EmptyState` with a `Button` that calls `Linking.openURL(uri)`. User-facing text stays in the piece, which reads the app's i18n strings; the module imports nothing from the app.

```ts
// modules/pdf-viewer/index.ts
export { PdfViewerView, isPdfViewerAvailable } from './src/PdfViewerView';
export type { PdfViewerViewProps } from './src/PdfViewer.types';
```

All three faces use `.tsx`, so no `resolution-collision`; the types file has its own base name. `requireNativeView` is exported by `expo` (it is `requireNativeViewManager` from `expo-modules-core`, which takes the same generic).

## Other Apple frameworks

Use the same three-face layout. Verify each Swift API on developer.apple.com before writing it.

| Framework | Swift entry point | Notes |
| --- | --- | --- |
| VisionKit (document scanner) | `VNDocumentCameraViewController` (a `UIViewController`, iOS 13+); check `VNDocumentCameraViewController.isSupported` first | Present it from a module `AsyncFunction` and resolve with the scanned page image URIs; delegate method names and `VNDocumentCameraScan` members are verified at use. Needs `NSCameraUsageDescription` in `ios.infoPlist`. |
| PencilKit (drawing) | `PKCanvasView` (a `UIScrollView` subclass) with `drawing: PKDrawing`, `tool`, `drawingPolicy`, `delegate` | Expose it as a view like `PdfViewerView`; send the drawing out as PNG data or `PKDrawing.dataRepresentation()` (verify at use). |
| Swift Charts | SwiftUI `Chart` with `BarMark` / `LineMark` | SwiftUI, not UIKit: Expo Modules can host SwiftUI views through the `ExpoSwiftUI.View` protocol with an `ExpoSwiftUI.ViewProps` props class (see `node_modules/expo-modules-core/ios/Core/Views/SwiftUI`; verify at use). Until then the `Chart` piece's DOM component serves iOS. |
| App Intents (Siri, Shortcuts, Spotlight) | `expo-app-intents` | Alpha in SDK 58 with frequent breaking changes: `npx expo-app-intents init`, intents in Swift. Use only when the owner asks for it. |

## Rules

- One module per framework; the module exposes the smallest API the piece needs (a view plus one or two events, or one async function).
- Module names in Swift (`Name("PdfViewer")`) and TypeScript (`requireNativeView('PdfViewer')`) match exactly.
- Every user-facing string comes from the app's i18n strings in the piece; Swift code and module files hold none.
- Permissions (camera, photo library) are declared in `app.json` `ios.infoPlist` with Arabic-first usage text.
- A module change is verified with `npx expo run:ios` on iPhone and iPad simulators, plus a web screenshot of the fallback.
