import { MicroCMSRelation } from "./generated/microcms-schema";

// カテゴリーリレーション型の拡張
export interface CategoryRelation extends MicroCMSRelation<unknown | null> {
  key: string;
  value: string;
}

// Work型のカテゴリーフィールド用にCategoryRelationの配列型を定義
export type CategoryRelationArray = CategoryRelation[];
