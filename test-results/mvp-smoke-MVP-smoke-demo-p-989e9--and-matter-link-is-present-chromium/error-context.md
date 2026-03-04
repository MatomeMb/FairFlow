# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - link "fairflow" [ref=e4] [cursor=pointer]:
      - /url: landing.html
    - generic [ref=e5]: Matter Demo
  - main [ref=e6]:
    - generic [ref=e7]:
      - heading "Matter Demo" [level=1] [ref=e8]
      - paragraph [ref=e9]:
        - text: Paste a
        - code [ref=e10]: matter://
        - text: URI below, then click the link to trigger the Lens overlay.
      - generic [ref=e11]:
        - generic [ref=e12]: Matter URI
        - textbox "Matter URI" [ref=e13]:
          - /placeholder: matter://<hash>
          - text: matter://bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96
        - paragraph [ref=e14]: Uses Shadow Index at http://localhost:3000. Install the Lens extension to see the overlay.
      - paragraph [ref=e15]:
        - text: "Link:"
        - link "matter://bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96" [ref=e16] [cursor=pointer]:
          - /url: matter://bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96
  - contentinfo [ref=e17]: Copyright 2026 fairflow
```