/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Medição do Google Analytics 4 (G-...). Ausente = medição desligada. */
  readonly VITE_GA_ID?: string
  /** Conversões do Google Ads (AW-...). Ausente = nenhuma conversão registrada. */
  readonly VITE_ADS_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
