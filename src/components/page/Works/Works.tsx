"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAccessibility, Heading } from "@/components/ui/";
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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import type { Work } from "@/cms/types/generated/work";
import type { Category } from "@/cms/types/generated/category";
import { CategoryRelation } from "@/cms/types/category-relation";
import DummyImage from "@/assets/images/dummy.png";

type WorksProps = {
  works: Work[]; // microCMSから取得した作品データ
  categories: Category[]; // microCMSから取得したカテゴリーデータ
};

export function Works({ works, categories }: WorksProps) {
  const { animationsEnabled } = useAccessibility();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const MotionDiv = animationsEnabled ? motion.div : "div";
  const urlUpdateRef = useRef(false);
  const isInitialRender = useRef(true);

  // データの安全性確認
  const worksArray = useMemo(() => {
    const safeWorks = works || [];
    return Array.isArray(safeWorks) ? safeWorks : [];
  }, [works]);

  const categoriesArray = useMemo(() => {
    const safeCategories = categories || [];
    return Array.isArray(safeCategories) ? safeCategories : [];
  }, [categories]);

  // 実績データから存在するカテゴリーキーを抽出
  const existingCategoryIds = useMemo(() => {
    const keys = new Set<string>();

    worksArray.forEach((work) => {
      if (work.category && Array.isArray(work.category)) {
        work.category.forEach((categoryRelation) => {
          // 型キャストを使用してCategoryRelation型として扱う
          const relation = categoryRelation as CategoryRelation;
          if (relation && typeof relation === "object" && relation.key) {
            keys.add(relation.key);
          }
        });
      }
    });

    return keys;
  }, [worksArray]);

  // デバッグ用にログ出力
  useEffect(() => {
    console.log("Works配列:", worksArray);
    console.log("カテゴリー配列:", categoriesArray);
    console.log("存在するカテゴリーキー:", [...existingCategoryIds]);

    // カテゴリーの詳細情報を出力
    if (categoriesArray.length > 0) {
      console.log("カテゴリー0の詳細:", categoriesArray[0]);
    }

    // Works[0]のカテゴリー情報があれば詳細を出力
    if (worksArray.length > 0 && worksArray[0].category && worksArray[0].category.length > 0) {
      console.log("Works[0]のカテゴリー0:", worksArray[0].category[0]);
    }
  }, [worksArray, categoriesArray, existingCategoryIds]);

  // カテゴリーキーからカテゴリーオブジェクトを取得する関数
  const getCategoryByKey = useCallback(
    (key: string) => {
      // 同じリレーションがあれば直接使用
      const workWithCategory = worksArray.find((work) =>
        work.category?.some((cat) => (cat as CategoryRelation).key === key),
      );
      if (workWithCategory) {
        return workWithCategory.category?.find(
          (cat) => (cat as CategoryRelation).key === key,
        ) as CategoryRelation;
      }
      return null;
    },
    [worksArray],
  );

  // カテゴリーオプションの作成
  const categoryOptions = useMemo(() => {
    // 「すべて」オプションは常に含める
    const options = [{ id: "all", name: "すべて" }];

    // 優先カテゴリー（すべての次に表示させたいカテゴリー）
    const priorityCategories = ["inhouse", "external"];

    // 優先カテゴリーを先に追加
    for (const priorityCatId of priorityCategories) {
      if (existingCategoryIds.has(priorityCatId)) {
        const category = getCategoryByKey(priorityCatId);
        if (category) {
          options.push({
            id: priorityCatId,
            name: category.value || priorityCatId,
          });
        } else {
          options.push({
            id: priorityCatId,
            name: priorityCatId,
          });
        }
      }
    }

    // 残りのカテゴリーを追加
    for (const categoryRelationId of existingCategoryIds) {
      // 既に追加した優先カテゴリーはスキップ
      if (priorityCategories.includes(categoryRelationId)) continue;

      const category = getCategoryByKey(categoryRelationId);
      if (category) {
        options.push({
          id: categoryRelationId,
          name: category.value || categoryRelationId,
        });
      } else {
        options.push({
          id: categoryRelationId,
          name: categoryRelationId,
        });
      }
    }

    return options;
  }, [existingCategoryIds, getCategoryByKey]);
  // カテゴリーオプションをログ出力（デバッグ用）
  useEffect(() => {
    console.log("Category Options:", categoryOptions);
  }, [categoryOptions]);

  // 選択されたカテゴリーの状態管理
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
  const [selectedWorkIndex, setSelectedWorkIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // カテゴリーでフィルタリングする関数
  const getFilteredWorks = useCallback((works: Work[], categoryIds: string[]) => {
    // 「すべて」が含まれているか、カテゴリーが選択されていない場合は全て表示
    if (categoryIds.includes("all") || categoryIds.length === 0) {
      return works;
    }

    // いずれかの選択カテゴリーに一致する作品を表示
    return works.filter((work) =>
      work.category?.some(
        (cat) =>
          cat &&
          typeof cat === "object" &&
          (cat as CategoryRelation).key &&
          categoryIds.includes((cat as CategoryRelation).key),
      ),
    );
  }, []);

  // カテゴリーの順番でソートする関数
  const getSortedByCategory = useCallback((works: Work[]) => {
    return [...works].sort((a, b) => {
      // カテゴリーがない場合は後ろに配置
      if (!a.category?.length) return 1;
      if (!b.category?.length) return -1;

      // 最初のカテゴリーを比較基準にする
      const aCat = a.category[0] as CategoryRelation;
      const bCat = b.category[0] as CategoryRelation;

      // カテゴリーキーを比較
      if (aCat?.key && bCat?.key) {
        return aCat.key.localeCompare(bCat.key);
      }

      return 0;
    });
  }, []);

  // カテゴリーでフィルタリングされた実績
  const filteredWorks = useMemo(() => {
    // まずフィルタリング
    const filtered = getFilteredWorks(worksArray, selectedCategories);
    // カテゴリー順でソート
    return getSortedByCategory(filtered);
  }, [worksArray, selectedCategories, getFilteredWorks, getSortedByCategory]);

  // URLを更新する関数
  const updateURL = useCallback(
    (categories: string[], workSlug?: string | null) => {
      urlUpdateRef.current = true;

      const shouldAddParams =
        workSlug ||
        (categories.length > 0 && !(categories.length === 1 && categories[0] === "all"));

      let url;

      if (shouldAddParams) {
        const categoryParam = categories.join(",");
        url = workSlug
          ? `${pathname}?category=${categoryParam}&work=${workSlug}#works`
          : `${pathname}?category=${categoryParam}#works`;
      } else {
        url = `${pathname}#works`;
      }

      // レンダリング中のルーター更新を避けるため、次のティックまで遅延させる
      setTimeout(() => {
        router.push(url, { scroll: false });
      }, 0);
    },
    [router, pathname],
  );

  // カテゴリー変更時の処理
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
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

        // カテゴリーが変更されたら常にURLを更新する
        updateURL(newCategories);

        return newCategories;
      });
    },
    [updateURL],
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

  // URLが変更されたときにステートを同期する
  useEffect(() => {
    // 手動でURLを更新している場合はスキップ
    if (urlUpdateRef.current) {
      urlUpdateRef.current = false;
      return;
    }

    // 現在のURL内にハッシュが#works以外の場合は何もしない
    const currentHash = window.location.hash;
    if (currentHash && currentHash !== "#works") {
      return;
    }

    // URLパラメータがない状態でWorksセクションにアクセスした場合
    if (currentHash === "#works" && !searchParams.toString()) {
      return;
    }

    const categoryParam = searchParams.get("category");
    const workSlug = searchParams.get("work");

    // カテゴリーの更新
    if (categoryParam) {
      const categoryIds = categoryParam.split(",");
      const validCategoryIds = categoryIds.filter(
        (id) => id === "all" || categoryOptions.some((c) => c.id === id),
      );

      if (
        validCategoryIds.length > 0 &&
        JSON.stringify(validCategoryIds) !== JSON.stringify(selectedCategories)
      ) {
        setSelectedCategories(validCategoryIds);
      }
    }

    // ワークの更新
    if (workSlug) {
      const currentCategories = categoryParam
        ? categoryParam
            .split(",")
            .filter((id) => id === "all" || categoryOptions.some((c) => c.id === id))
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
  }, [searchParams, categoryOptions, worksArray, getFilteredWorks, selectedCategories]);

  // カテゴリー選択が変更されたときにURLを更新
  useEffect(() => {
    // 初回レンダリング時はURLを更新しない
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // URLが既に更新中の場合はスキップ
    if (urlUpdateRef.current) return;

    // モーダルが開いている場合は必ずURLを更新する
    if (isModalOpen && selectedWorkIndex >= 0 && selectedWorkIndex < filteredWorks.length) {
      updateURL(selectedCategories, filteredWorks[selectedWorkIndex].slug);
      return;
    }

    // ハッシュが#worksの場合のみ、自動的なURL更新を行う
    const currentHash = window.location.hash;
    if (currentHash === "#works") {
      // URLのワークスラッグを取得
      const workSlug = searchParams.get("work");

      // ユーザーが明示的にカテゴリーを変更した場合のみ更新
      const userChangedCategories =
        !(selectedCategories.length === 1 && selectedCategories[0] === "all") || isModalOpen;

      if (!userChangedCategories) {
        // デフォルト状態の場合でも、既にURLにパラメータがある場合はクリーンにする
        if (
          searchParams.toString() &&
          selectedCategories.length === 1 &&
          selectedCategories[0] === "all" &&
          !isModalOpen
        ) {
          urlUpdateRef.current = true;
          router.push(`${pathname}#works`, { scroll: false });
        }
        return;
      }

      // 選択されているワークがある場合とない場合でURLを更新
      if (workSlug && isModalOpen) {
        updateURL(selectedCategories, workSlug);
      } else if (!(selectedCategories.length === 1 && selectedCategories[0] === "all")) {
        // カテゴリー選択が「すべて」以外の場合のみURLを更新
        updateURL(selectedCategories);
      }
    }
  }, [
    selectedCategories,
    filteredWorks,
    isModalOpen,
    selectedWorkIndex,
    searchParams,
    updateURL,
    pathname,
    router,
  ]);

  // データがなければメッセージを表示
  if (worksArray.length === 0) {
    return (
      <section id="works" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Heading subTitle="Works">実績一覧</Heading>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                現在表示できる実績はありません
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const getMotionProps = (props) => {
    return animationsEnabled ? props : {};
  };

  return (
    <section id="works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="max-w-5xl px-4 md:px-6 mx-auto">
        <MotionDiv
          className="flex flex-col md:flex-row items-center md:gap-12"
          {...getMotionProps({
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
          })}
        >
          <div>
            <Heading subTitle="Works">実績一覧</Heading>
          </div>

          <div className="my-8 flex flex-col space-y-2 md:space-y-4 flex-grow">
            {/* inhouse, external カテゴリー */}
            <div className="flex flex-wrap md:gap-2">
              {categoryOptions
                .filter((cat) => ["inhouse", "external"].includes(cat.id))
                .map((category) => (
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

            {/* その他のカテゴリー */}
            <div className="flex flex-wrap md:gap-2">
              {categoryOptions
                .filter((cat) => !["all", "inhouse", "external"].includes(cat.id))
                .map((category) => (
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

            {/* 「すべて」カテゴリー */}
            <div className="flex">
              <Button
                key="all"
                variant={selectedCategories.includes("all") ? "default" : "outline"}
                onClick={() => handleCategoryChange("all")}
                className="m-1 w-full"
              >
                すべて
              </Button>
            </div>
          </div>
        </MotionDiv>

        <div className="mx-auto grid gap-6 py-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorks.map((work, index) => (
            <MotionDiv
              key={work.slug || index}
              {...getMotionProps({
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: index * 0.1 },
              })}
            >
              <Card className="h-full flex flex-col overflow-hidden group pt-0">
                <CardHeader className="p-0 gap-0">
                  <div className="overflow-hidden aspect-[810/504]">
                    <Image
                      src={
                        work.thumbnail && work.thumbnail.length > 0
                          ? work.thumbnail[0].url
                          : DummyImage.src
                      }
                      alt=""
                      className="w-full h-full object-cover duration-300"
                      width={400}
                      height={300}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4 flex flex-wrap gap-y-2 gap-x-1">
                    {work.category?.map((categoryRelation, idx) => {
                      const relation = categoryRelation as CategoryRelation;
                      if (!relation || typeof relation !== "object" || !relation.key) return null;

                      return (
                        <Badge key={idx} variant="outline">
                          {relation.value || relation.key}
                        </Badge>
                      );
                    })}
                  </div>
                  <CardTitle className="mb-2 text-lg">{work.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {work.description}
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-y-2 gap-x-1">
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
