"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// カテゴリー文字列の型
type WorkCategory = NonNullable<Work["category"]>[number];

export function Works({ works }: WorksProps) {
  const { animationsEnabled } = useAccessibility();
  const router = useRouter();
  const searchParams = useSearchParams();
  const MotionDiv = animationsEnabled ? motion.div : "div";
  const urlUpdateRef = useRef(false);

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
    個人案件: "個人案件",
    業務案件: "業務案件",
    採用サイト: "採用サイト",
  };

  // 存在するカテゴリーだけのリストを生成（「すべて」を含む）
  const categories: Category[] = [
    { id: "all", name: "すべて" },
    ...Array.from(existingCategoryIds).map((id) => ({
      id,
      name: categoryNameMap[id] || id, // マッピングがなければIDをそのまま表示
    })),
  ];

  // 選択されたカテゴリーの状態管理（複数選択に対応）
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
  // モーダル表示のための状態
  const [selectedWorkIndex, setSelectedWorkIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // カテゴリーでフィルタリングする純粋な関数
  const getFilteredWorks = useCallback((works: Work[], categoryIds: string[]) => {
    // 「すべて」が含まれているか、カテゴリーが選択されていない場合は全て表示
    if (categoryIds.includes("all") || categoryIds.length === 0) {
      return works;
    }

    // いずれかの選択カテゴリーに一致する作品を表示
    return works.filter((work) =>
      work.category?.some((cat) => categoryIds.includes(cat as WorkCategory)),
    );
  }, []);

  // カテゴリーでフィルタリングされた実績
  const filteredWorks = getFilteredWorks(worksArray, selectedCategories);

  // カテゴリー変更時の処理
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => {
      let newCategories: string[];

      // 「すべて」が選択された場合
      if (categoryId === "all") {
        newCategories = ["all"];
      }
      // 既に選択されている場合は選択解除
      else if (prev.includes(categoryId)) {
        newCategories = prev.filter((id) => id !== categoryId);
        // 選択カテゴリーが空になった場合は「すべて」を選択
        if (
          newCategories.length === 0 ||
          (newCategories.length === 1 && newCategories[0] === "all")
        ) {
          newCategories = ["all"];
        }
      }
      // 新しいカテゴリーが選択された場合
      else {
        // 現在「すべて」だけが選択されていれば、それを除去
        newCategories =
          prev.includes("all") && prev.length === 1
            ? [categoryId]
            : [...prev.filter((id) => id !== "all"), categoryId];
      }

      return newCategories;
    });
  }, []);

  // URLを更新する関数（状態変更とは分離）
  const updateURL = useCallback(
    (categories: string[], workSlug?: string | null) => {
      urlUpdateRef.current = true;
      const categoryParam = categories.join(",");
      const url = workSlug
        ? `?category=${categoryParam}&work=${workSlug}#works`
        : `?category=${categoryParam}#works`;

      router.push(url, { scroll: false });
    },
    [router],
  );

  // モーダルを開く関数
  const openWorkModal = useCallback(
    (index: number) => {
      if (index >= 0 && index < filteredWorks.length) {
        setSelectedWorkIndex(index);
        setIsModalOpen(true);
        updateURL(selectedCategories, filteredWorks[index].slug);
      }
    },
    [filteredWorks, selectedCategories, updateURL],
  );

  // モーダルを閉じる関数
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    updateURL(selectedCategories);
  }, [selectedCategories, updateURL]);

  // モーダル内でワークを切り替える関数
  const navigateModal = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < filteredWorks.length) {
        setSelectedWorkIndex(newIndex);
        updateURL(selectedCategories, filteredWorks[newIndex].slug);
      }
    },
    [filteredWorks, selectedCategories, updateURL],
  );

  // URLが変更されたときにステートを同期
  useEffect(() => {
    // 手動でURLを更新している場合はスキップ（無限ループ防止）
    if (urlUpdateRef.current) {
      urlUpdateRef.current = false;
      return;
    }

    const categoryParam = searchParams.get("category");
    const workSlug = searchParams.get("work");

    // カテゴリーの更新
    if (categoryParam) {
      const categoryIds = categoryParam.split(",");
      const validCategoryIds = categoryIds.filter(
        (id) => id === "all" || categories.some((c) => c.id === id),
      );

      if (
        validCategoryIds.length > 0 &&
        JSON.stringify(validCategoryIds) !== JSON.stringify(selectedCategories)
      ) {
        setSelectedCategories(validCategoryIds);
      }
    }

    // ワークの更新（URLパラメータから直接カテゴリーを取得して計算）
    if (workSlug) {
      const currentCategories = categoryParam
        ? categoryParam
            .split(",")
            .filter((id) => id === "all" || categories.some((c) => c.id === id))
        : ["all"];

      const currentWorks = getFilteredWorks(worksArray, currentCategories);
      const workIndex = currentWorks.findIndex((w) => w.slug === workSlug);

      if (workIndex !== -1) {
        setSelectedWorkIndex(workIndex);
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams, categories, worksArray, getFilteredWorks, selectedCategories]);

  // カテゴリー選択が変更されたときにURLを更新
  useEffect(() => {
    // URLのワークスラッグを取得
    const workSlug = searchParams.get("work");

    // URLが既に更新中の場合はスキップ
    if (urlUpdateRef.current) return;

    // 選択されているワークがある場合とない場合でURLを更新
    if (isModalOpen && selectedWorkIndex >= 0 && selectedWorkIndex < filteredWorks.length) {
      updateURL(selectedCategories, filteredWorks[selectedWorkIndex].slug);
    } else if (workSlug) {
      updateURL(selectedCategories, workSlug);
    } else {
      updateURL(selectedCategories);
    }
  }, [selectedCategories, filteredWorks, isModalOpen, selectedWorkIndex, searchParams, updateURL]);

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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">WORKS</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">制作実績</p>
          </div>
        </MotionDiv>

        <div className="my-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategories.includes(category.id) ? "default" : "outline"}
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
              <Card className="h-full flex flex-col overflow-hidden group pt-0">
                <CardHeader className="p-0 gap-0">
                  <div className="overflow-hidden aspect-[810/504]">
                    <Image
                      src={
                        work.thumbnail && work.thumbnail.length > 0
                          ? work.thumbnail[0].url
                          : "/placeholder.svg"
                      }
                      alt=""
                      className="w-full h-full object-cover duration-300"
                      width={400}
                      height={300}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4 flex flex-wrap gap-1">
                    {work.category?.map((categoryId, idx) => {
                      const category = categories.find((c) => c.id === categoryId);
                      return category ? (
                        <Badge key={idx} variant="outline">
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <CardTitle className="mb-2 text-lg">{work.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {work.description}
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {work.technologies?.map((technology, idx) => {
                      return (
                        <Badge key={idx} variant="secondary">
                          {technology}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
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
          onNavigate={navigateModal}
        />
      )}
    </section>
  );
}
