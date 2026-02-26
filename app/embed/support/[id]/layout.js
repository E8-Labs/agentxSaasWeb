export const metadata = {
  title: 'Support Widget',
  viewport: 'width=device-width, initial-scale=1',
}

export default function EmbedLayout({ children }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            background-color: transparent !important;
            overflow: hidden !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `,
        }}
      />
      {children}
    </>
  )
}
