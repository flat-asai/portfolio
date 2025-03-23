"use client";

import { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/components/ui/AccessibilityProvider";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProjectModal } from "./WorksModal";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Work } from "@/cms/types/generated/work";

// カテゴリーの型定義
type Category = {
  id: string;
  name: string;
};

type WorksProps = {
  works: Work[]; // microCMSから取得した作品データ
};

export function Works({ works }: WorksProps) {
  const { animationsEnabled } = useAccessibility();
  const router = useRouter();
  const searchParams = useSearchParams();
  const MotionDiv = animationsEnabled ? motion.div : "div";

  // コンソールでデータを確認
  console.log("Works prop:", works);

  // works が undefined/null の場合は空配列を使用
  const safeWorks = works || [];

  // 配列かどうか確認し、配列でなければ空配列に変換
  const worksArray = Array.isArray(safeWorks) ? safeWorks : [];

  // 実績データから存在するカテゴリーを抽出
  const existingCategoryIds = new Set<string>();

  // すべての記事からカテゴリーIDを収集
  worksArray.forEach((work) => {
    if (work.category && Array.isArray(work.category)) {
      work.category.forEach((categoryId) => {
        existingCategoryIds.add(categoryId);
      });
    }
  });

  // カテゴリー名のマッピング
  const categoryNameMap: Record<string, string> = {
    コーポレートサイト: "コーポレートサイト",
    ECサイト: "ECサイト",
    サービスサイト: "サービスサイト",
    アーカイブサイト: "アーカイブサイト",
    ランディングページ: "ランディングページ",
  };
  // 存在するカテゴリーだけのリストを生成（「すべて」を含む）
  const categories: Category[] = [
    { id: "all", name: "すべて" },
    ...Array.from(existingCategoryIds).map((id) => ({
      id,
      name: categoryNameMap[id] || id, // マッピングがなければIDをそのまま表示
    })),
  ];

  console.log("Available categories:", categories);

  // モーダル表示のための状態
  const [selectedWorkIndex, setSelectedWorkIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 手動でモーダルを閉じたことを追跡するフラグ
  const isClosingManually = useRef(false);

  // 選択されたカテゴリーの状態管理
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // URLパラメータからカテゴリーとプロジェクトを取得して設定
  useEffect(() => {
    // 手動で閉じた直後は処理をスキップ
    if (isClosingManually.current) {
      isClosingManually.current = false;
      return;
    }

    const workSlug = searchParams.get("work");
    const category = searchParams.get("category");

    // カテゴリーパラメータがある場合は設定
    if (category && categories.some((c) => c.id === category)) {
      setSelectedCategory(category);
    }

    // ワークスラッグがある場合
    if (workSlug) {
      // 現在のカテゴリーでフィルタリングされたワーク一覧
      const currentWorks =
        category && category !== "all"
          ? worksArray.filter((w) =>
              w.category?.includes(
                category as
                  | "コーポレートサイト"
                  | "ECサイト"
                  | "サービスサイト"
                  | "アーカイブサイト"
                  | "ランディングページ",
              ),
            )
          : worksArray;

      // ワークのインデックスを検索
      const workIndex = currentWorks.findIndex((w) => w.slug === workSlug);
      if (workIndex !== -1) {
        setSelectedWorkIndex(workIndex);
        setIsModalOpen(true);
      }
    } else {
      // ワークスラッグがない場合はモーダルを閉じる
      setIsModalOpen(false);
    }
  }, [searchParams, worksArray]); // categoriesは削除

  // カテゴリーでフィルタリングされた実績
  const filteredWorks =
    selectedCategory === "all"
      ? worksArray
      : worksArray.filter((work) =>
          work.category?.includes(
            selectedCategory as
              | "コーポレートサイト"
              | "ECサイト"
              | "サービスサイト"
              | "アーカイブサイト"
              | "ランディングページ",
          ),
        );

  console.log("Filtered works:", filteredWorks);

  // データがなければメッセージを表示
  if (worksArray.length === 0) {
    return (
      <section id="works" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                実績一覧
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                現在表示できる実績はありません
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ワーク詳細を表示する関数
  const openWorkModal = (index: number) => {
    const workSlug = filteredWorks[index].slug;
    // URLにパラメータを追加（カテゴリーも含める）
    router.push(`?category=${selectedCategory}&work=${workSlug}#works`, { scroll: false });
    setSelectedWorkIndex(index);
    setIsModalOpen(true);
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    // 手動で閉じるフラグを設定
    isClosingManually.current = true;

    // モーダルを閉じる
    setIsModalOpen(false);

    // URLからプロジェクトパラメータを削除
    router.push(`?category=${selectedCategory}#works`, { scroll: false });
  };

  // カテゴリー変更時の処理
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // URLのカテゴリーパラメータを更新
    router.push(`?category=${categoryId}#works`, { scroll: false });
  };

  return (
    <section id="works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <MotionDiv
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
          whileInView={animationsEnabled ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              実績一覧
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              アクセシビリティを重視した制作実績をご紹介します
            </p>
          </div>
        </MotionDiv>

        <div className="my-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => handleCategoryChange(category.id)}
              className="m-1"
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 py-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorks.map((work, index) => (
            <MotionDiv
              key={work.slug || index}
              initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
              whileInView={animationsEnabled ? { opacity: 1, y: 0 } : {}}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden group">
                <CardHeader className="p-0">
                  <div className="overflow-hidden">
                    <Image
                      src={
                        work.thumbnail && work.thumbnail.length > 0
                          ? work.thumbnail[0].url
                          : "/placeholder.svg"
                      }
                      alt={`${work.title}のサムネイル`}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-300"
                      width={400}
                      height={300}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <div className="mb-2 flex flex-wrap gap-1">
                    {work.category?.map((categoryId, idx) => {
                      const category = categories.find((c) => c.id === categoryId);
                      return category ? (
                        <Badge key={idx} variant="secondary">
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <CardTitle className="mb-2">{work.title}</CardTitle>
                  <CardDescription>{work.description}</CardDescription>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                  <Button className="w-full" onClick={() => openWorkModal(index)}>
                    詳細を見る
                  </Button>
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>

      {/* ワーク詳細モーダル */}
      {isModalOpen && selectedWorkIndex >= 0 && filteredWorks.length > 0 && (
        <ProjectModal
          works={filteredWorks}
          currentIndex={selectedWorkIndex}
          isOpen={isModalOpen}
          onClose={closeModal}
          onNavigate={(newIndex) => {
            const workSlug = filteredWorks[newIndex].slug;
            router.push(`?category=${selectedCategory}&work=${workSlug}#works`, { scroll: false });
            setSelectedWorkIndex(newIndex);
          }}
        />
      )}
    </section>
  );
}
