import React from "react"
import type { Metadata } from "next"
import "@style/globals.scss"
import Wrap from "@/componenets/wrap"
import { AuthProvider } from "@/provider/AuthProvider"

export const metadata: Metadata = {
  title: "ZeroBeat",
  description: "music service",
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html>  
    <body suppressHydrationWarning={true}>
      <AuthProvider>
        <Wrap>
          {children}
        </Wrap>
      </AuthProvider>
    </body>
  </html>
)

export default RootLayout