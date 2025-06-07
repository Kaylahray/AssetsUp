"use client"

import type React from "react"

import { BoxShadowGenerator } from "@/components/tools/box-shadow-generator"
import { HashGenerator } from "@/components/tools/hash-generator"
import { RegexTester } from "@/components/tools/regex-tester"
import { JwtDecoder } from "@/components/tools/jwt-decoder"
import { Base64Tool } from "@/components/tools/base64-tool"
import { JsonFormatter } from "@/components/tools/json-formatter"
import { AddressShortener } from "@/components/tools/address-shortener"
import { StarknetReader } from "@/components/tools/starknet-reader"
import { WebScreenshotTool } from "@/components/tools/web-screenshot-tool"
import { PdfGeneratorTool } from "@/components/tools/pdf-generator-tool"
import { UptimeMonitorTool } from "@/components/tools/uptime-monitor-tool"
import { CodeSnippetSaver } from "@/components/tools/code-snippet-saver"

// Map of tool slugs to their components
export const ToolComponents: Record<string, React.ComponentType> = {
  "box-shadow": BoxShadowGenerator,
  "hash-generator": HashGenerator,
  "regex-tester": RegexTester,
  "jwt-decoder": JwtDecoder,
  base64: Base64Tool,
  "json-formatter": JsonFormatter,
  "address-shortener": AddressShortener,
  "starknet-reader": StarknetReader,
  "web-screenshot": WebScreenshotTool,
  "pdf-generator": PdfGeneratorTool,
  "uptime-monitor": UptimeMonitorTool,
  "code-snippets": CodeSnippetSaver,
}
