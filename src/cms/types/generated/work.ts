import { MicroCMSImage } from './microcms-schema';



export type Work = {
  /**
   * タイトル
   */
  title: string
  /**
   * スラッグ
   */
  slug: string
  /**
   * 概要
   */
  description?: string
  /**
   * 詳細説明
   */
  body?: string
  /**
   * サムネイル画像
   */
  thumbnail?: MicroCMSImage[]
  /**
   * 担当した作業範囲
   */
  roles?: ('制作ディレクション' | '撮影ディレクション' | '要件定義' | 'サイト設計' | 'ワイヤーフレーム' | 'デザイン' | 'コーディング' | 'CMS構築' | 'API連携' | 'アクセシビリティ対応' | 'SEO最適化' | 'パフォーマンス改善' | '多言語対応' | 'クライアント対応' | 'サイト公開作業' | 'サイト運用')[]
  /**
   * 使用技術
   */
  technologies?: ('HTML' | 'CSS' | 'JavaScript' | 'TypeScript' | 'React' | 'Next.js' | 'Astro' | 'Vue.js' | 'Nuxt.js' | 'jQuery' | 'Tailwind CSS' | 'Sass（SCSS）' | 'CSS Modules' | 'microCMS' | 'Newt' | 'WordPress' | 'Figma' | 'Adobe XD' | 'Photoshop' | 'Illustrator' | 'Git / GitHub' | 'ESLint / Prettier' | 'Storybook' | 'Google Maps JavaScript API')[]
  /**
   * 制作期間
   */
  duration?: string
  /**
   * URL
   */
  url?: string
  /**
   * 種別
   */
  type?: ['個人案件' | '業務案件']
}

