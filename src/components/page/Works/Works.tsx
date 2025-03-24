"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAccessibility, Heading, Badge, Button } from "@/components/ui/";
import { motion } from "framer-motion";
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

export function Works({ works }: WorksProps) {
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

  // 選択されたカテゴリーの状態管理
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
  const [selectedWorkSlug, setSelectedWorkSlug] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // カテゴリーでフィルタリングする関数
  const getFilteredWorks = useCallback((works: Work[], categoryIds: string[]) => {
    // 「すべて」が含まれているか、カテゴリーが選択されていない場合は全て表示
    if (categoryIds.includes("all") || categoryIds.length === 0) {
      return works;
    }

    return works.filter((work) => {
      const workCategories = work.category?.map((cat) => (cat as CategoryRelation).key) || [];

      // inhouse/externalの選択状態
      const hasSelectedInhouse = categoryIds.includes("inhouse");
      const hasSelectedExternal = categoryIds.includes("external");

      // 作品のメインカテゴリ状態
      const workHasInhouse = workCategories.includes("inhouse");
      const workHasExternal = workCategories.includes("external");

      // メインカテゴリの条件をチェック - 少なくとも一つが一致する必要がある
      const matchesMainCategory =
        (!hasSelectedInhouse && !hasSelectedExternal) || // メイン未選択時は次の条件へ
        (hasSelectedInhouse && workHasInhouse) || // inhouseが選択され、作品もinhouse
        (hasSelectedExternal && workHasExternal); // externalが選択され、作品もexternal

      if (!matchesMainCategory) return false;

      // サブカテゴリの選択状態
      const selectedSubCategories = categoryIds.filter(
        (id) => id !== "inhouse" && id !== "external" && id !== "all",
      );

      // サブカテゴリが選択されていない場合、メインカテゴリのみで判定
      if (selectedSubCategories.length === 0) {
        return true;
      }

      // 選択されたサブカテゴリのいずれかと一致するか
      return selectedSubCategories.some((catId) => workCategories.includes(catId));
    });
  }, []);

  // // カテゴリーの順番でソートする関数
  // const getSortedByCategory = useCallback((works: Work[]) => {
  //   return [...works].sort((a, b) => {
  //     // カテゴリーがない場合は後ろに配置
  //     if (!a.category?.length) return 1;
  //     if (!b.category?.length) return -1;

  //     // 最初のカテゴリーを比較基準にする
  //     const aCat = a.category[0] as CategoryRelation;
  //     const bCat = b.category[0] as CategoryRelation;

  //     // カテゴリーキーを比較
  //     if (aCat?.key && bCat?.key) {
  //       return aCat.key.localeCompare(bCat.key);
  //     }

  //     return 0;
  //   });
  // }, []);

  const getCategoryMapping = useCallback(() => {
    const mapping = {
      inhouse: new Set<string>(),
      external: new Set<string>(),
    };

    worksArray.forEach((work) => {
      // 作品のカテゴリー情報を取得
      const categories =
        work.category?.map((cat) => (cat as CategoryRelation).key).filter(Boolean) || [];

      // inhouseまたはexternalカテゴリーを持つか確認
      const hasInhouse = categories.includes("inhouse");
      const hasExternal = categories.includes("external");

      // サブカテゴリーを適切なメインカテゴリーにマッピング
      categories.forEach((cat) => {
        if (cat !== "inhouse" && cat !== "external") {
          if (hasInhouse) mapping.inhouse.add(cat);
          if (hasExternal) mapping.external.add(cat);
        }
      });
    });

    return mapping;
  }, [worksArray]);

  // カテゴリーマッピングをメモ化
  const categoryMapping = useMemo(() => getCategoryMapping(), [getCategoryMapping]);

  // 表示すべきサブカテゴリーを計算
  const visibleSubCategories = useMemo(() => {
    return categoryOptions.filter((cat) => !["all", "inhouse", "external"].includes(cat.id));
  }, [categoryOptions]);
  // カテゴリーでフィルタリングされた実績
  const filteredWorks = useMemo(() => {
    // まずフィルタリング
    const filtered = getFilteredWorks(worksArray, selectedCategories);

    return filtered;
  }, [worksArray, selectedCategories, getFilteredWorks]);

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
          if (newCategories.length === 0) {
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
        // インデックスを直接保存する代わりにスラグを保存
        const workSlug = filteredWorks[index].slug;
        setSelectedWorkSlug(workSlug);
        setIsModalOpen(true);
        updateURL(selectedCategories, workSlug);
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
        // インデックスを直接保存する代わりにスラグを保存
        const workSlug = filteredWorks[newIndex].slug;
        setSelectedWorkSlug(workSlug);
        updateURL(selectedCategories, workSlug);
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
    if (currentHash === "#works" && !searchParams?.toString()) return;

    const categoryParam = searchParams?.get("category");
    const workSlug = searchParams?.get("work");

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

    // ワークの更新 - スラグベースで処理
    if (workSlug) {
      setSelectedWorkSlug(workSlug);
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams, categoryOptions, selectedCategories]);

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
    if (isModalOpen && selectedWorkSlug) {
      updateURL(selectedCategories, selectedWorkSlug);
      return;
    }

    // ハッシュが#worksの場合のみ、自動的なURL更新を行う
    const currentHash = window.location.hash;
    if (currentHash === "#works") {
      // URLのワークスラッグを取得
      const workSlug = searchParams?.get("work");

      // ユーザーが明示的にカテゴリーを変更した場合のみ更新
      const userChangedCategories =
        !(selectedCategories.length === 1 && selectedCategories[0] === "all") || isModalOpen;

      if (!userChangedCategories) {
        // デフォルト状態の場合でも、既にURLにパラメータがある場合はクリーンにする
        if (
          searchParams?.toString() &&
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
    selectedWorkSlug,
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

  const getMotionProps = (props: Record<string, unknown>) => {
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
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))}
            </div>

            {/* その他のカテゴリー - 選択されたメインカテゴリーに応じて動的に表示 */}
            <div className="flex flex-wrap md:gap-2">
              {visibleSubCategories.map((category) => {
                // 現在選択されているメインカテゴリーを確認
                const hasInhouse = selectedCategories.includes("inhouse");
                const hasExternal = selectedCategories.includes("external");
                const isAllSelected = selectedCategories.includes("all");
                const isSelected = selectedCategories.includes(category.id);

                // サブカテゴリーが現在選択されているメインカテゴリーに関連付けられているか確認
                const isLinkedToInhouse = categoryMapping.inhouse.has(category.id);
                const isLinkedToExternal = categoryMapping.external.has(category.id);

                // 視覚的に無効化する条件（選択中の場合は除く）：
                // - 「すべて」が選択されていない状態で
                // - 選択されているメインカテゴリー(inhouse/external)に関連付けられていない
                const visuallyDisabled =
                  !isSelected &&
                  !isAllSelected &&
                  ((hasInhouse && !isLinkedToInhouse && !hasExternal) ||
                    (hasExternal && !isLinkedToExternal && !hasInhouse) ||
                    (hasInhouse && hasExternal && !isLinkedToInhouse && !isLinkedToExternal));

                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`m-1 ${visuallyDisabled ? "cursor-not-allowed hover:no-underline bg-border text-muted-foreground" : ""}`}
                    disabled={visuallyDisabled}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                );
              })}
            </div>

            {/* 「すべて」カテゴリー */}
            <div className="flex">
              <Button
                key="all"
                variant={selectedCategories.includes("all") ? "default" : "outline"}
                onClick={() => handleCategoryChange("all")}
                className="m-1 w-full"
                size="sm"
              >
                すべて
              </Button>
            </div>
          </div>
        </MotionDiv>

        {filteredWorks.length === 0 ? (
          <div className="mx-auto py-6 text-center min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-sm md:text-base">
              選択されたカテゴリーに該当する実績はありません
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* ワーク詳細モーダル */}
      {isModalOpen && selectedWorkSlug && filteredWorks.length > 0 && (
        <ProjectModal
          works={filteredWorks}
          // インデックスではなくスラグを使用してインデックスを計算
          currentIndex={filteredWorks.findIndex((w) => w.slug === selectedWorkSlug)}
          isOpen={isModalOpen}
          onClose={closeModal}
          onNavigate={navigateModal}
        />
      )}
    </section>
  );
}
