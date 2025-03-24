"use client";

import type React from "react";
import type { Work } from "@/cms/types/generated/work";
import { CategoryRelation } from "@/cms/types/category-relation";

import { useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, SquareArrowOutUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAccessibility } from "@/components/ui/AccessibilityProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ProjectModalProps = {
  works: Work[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
};

export function ProjectModal({
  works,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ProjectModalProps) {
  const { animationsEnabled } = useAccessibility();

  const currentWork = works[currentIndex];
  const isFirstProject = currentIndex === 0;
  const isLastProject = currentIndex === works.length - 1;

  const modalContentRef = useRef<HTMLDivElement>(null);
  const mainPageScrollPos = useRef(0);

  // モーダルが開いたときにメインページのスクロール位置を保存
  useEffect(() => {
    if (isOpen) {
      mainPageScrollPos.current = window.scrollY;
    }
  }, [isOpen]);

  // スクロール位置をリセットする関数
  const resetScroll = useCallback(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, []);

  // AnimatePresenceのモードをwaitからsyncに変更
  // これにより、退場アニメーションが完了する前に次のコンテンツが入場できるようになる
  const animatePresenceMode = "sync";

  // ナビゲーション時のハンドラー
  const handleNavigate = useCallback(
    (newIndex: number) => {
      // 即座にコンテンツを変更し、AnimatePresenceにトランジションを任せる
      onNavigate(newIndex);

      // 次のフレームでスクロールをリセット（見えないタイミングでリセット）
      requestAnimationFrame(() => {
        resetScroll();
      });
    },
    [onNavigate, resetScroll],
  );

  // 前のプロジェクトに移動
  const navigateToPrevious = useCallback(() => {
    if (!isFirstProject) {
      handleNavigate(currentIndex - 1);
    }
  }, [handleNavigate, currentIndex, isFirstProject]);

  // 次のプロジェクトに移動
  const navigateToNext = useCallback(() => {
    if (!isLastProject) {
      handleNavigate(currentIndex + 1);
    }
  }, [handleNavigate, currentIndex, isLastProject]);

  // モーダルの表示が変わったらメインページのスクロール位置を維持
  useEffect(() => {
    if (isOpen && currentWork) {
      // メインページのスクロール位置を維持
      window.scrollTo(0, mainPageScrollPos.current);
    }
  }, [isOpen, currentWork]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && !isFirstProject) {
        navigateToPrevious();
      } else if (event.key === "ArrowRight" && !isLastProject) {
        navigateToNext();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // モーダル表示時にスクロールを無効化
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      // モーダル閉じたらスクロールを有効化
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, isFirstProject, isLastProject, navigateToPrevious, navigateToNext]);

  // モーダル外クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 閉じるボタンのクリックハンドラー - イベント伝播を停止
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  if (!isOpen || !currentWork) return null;

  // サムネイル画像のURLを取得
  const thumbnailUrl =
    currentWork.thumbnail && currentWork.thumbnail.length > 0
      ? currentWork.thumbnail[1]?.url || currentWork.thumbnail[0].url
      : "/placeholder.svg";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 pt-4 pb-10 md:p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={handleCloseClick}
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </Button>
        <motion.div
          ref={modalContentRef}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-background shadow-lg"
          initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : {}}
          animate={animationsEnabled ? { opacity: 1, scale: 1 } : {}}
          exit={animationsEnabled ? { opacity: 0, scale: 0.95 } : {}}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode={animatePresenceMode}>
            <motion.div
              key={currentWork.slug}
              initial={animationsEnabled ? { opacity: 0 } : {}}
              animate={animationsEnabled ? { opacity: 1 } : {}}
              exit={animationsEnabled ? { opacity: 0 } : {}}
              transition={{ duration: 0.2 }}
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <div className="absolute inset-0">
                  <Image
                    src={thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    width={800}
                    height={600}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
                </div>
                <div className="md:absolute md:bottom-0 md:left-0 p-4 md:p-6 flex flex-col-reverse gap-4">
                  <h2
                    id="project-modal-title"
                    className="text-2xl md:text-4xl font-bold text-foreground mb-2"
                  >
                    {currentWork.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {currentWork.category?.map((categoryRelation, idx) => {
                      const relation = categoryRelation as CategoryRelation;
                      if (!relation || typeof relation !== "object" || !relation.key) return null;

                      return (
                        <Badge key={idx} variant="outline">
                          {relation.value || relation.key}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                <section className="relative border pt-10 pb-6 px-4 md:px-6 rounded-md">
                  <h3 className="absolute px-2 md:px-4 py-2 z-10 top-0 left-2 md:left-4 mb-4 flex items-center gap-4 -translate-y-1/2 bg-background">
                    <span
                      className="text-xl md:text-3xl font-semibold"
                      style={{ fontFamily: "var(--font-montserrat)" }}
                      aria-hidden="true"
                    >
                      Overview
                    </span>
                    <span className="text-sm md:text-base text-muted-foreground">概要</span>
                  </h3>
                  <p
                    className="text-sm md:text-base leading-loose mb-8 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: currentWork.description || "" }}
                  />

                  {currentWork.roles && currentWork.roles.length > 0 && (
                    <section className="flex flex-col md:flex-row gap-4 md:items-center">
                      <h4 className="text-md font-semibold min-w-[6em]">担当範囲</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentWork.roles.map((role, index) => (
                          <Badge key={index} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {currentWork.technologies && currentWork.technologies.length > 0 && (
                    <section className="flex flex-col md:flex-row gap-4 md:items-center border-t pt-4 mt-4">
                      <h4 className="text-md font-semibold min-w-[6em]">使用技術</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentWork.technologies?.map((tech, index) => (
                          <Badge key={index} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {currentWork.duration && (
                    <section className="flex flex-col md:flex-row gap-4 md:items-center border-t pt-4 mt-4">
                      <h4 className="text-md font-semibold min-w-[6em]">制作期間</h4>
                      <p className="text-sm md:text-md">{currentWork.duration}</p>
                    </section>
                  )}
                </section>

                {currentWork.body && (
                  <section className="pb-6">
                    <h3 className="sr-only">詳細</h3>
                    <div
                      className="rich-text-content"
                      dangerouslySetInnerHTML={{ __html: currentWork.body }}
                    />
                  </section>
                )}
                <div className="sticky bottom-6">
                  {currentWork.url && (
                    <Button asChild>
                      <a
                        href={currentWork.url}
                        target="_blank"
                        className="block w-full"
                        rel="noopener noreferrer"
                        aria-label="サイトを開く"
                      >
                        {currentWork.url}
                        <SquareArrowOutUpRight className="w-5 h-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {/* ナビゲーションボタン */}
        <div className="absolute left-0 md:left-[-8px] top-[calc(100%+8px)] md:top-1/2 z-10 md:translate-y-1/2 md:-translate-x-[100%]">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full bg-background/80 backdrop-blur-md",
              isFirstProject && "opacity-0 invisible cursor-not-allowed",
            )}
            onClick={navigateToPrevious}
            disabled={isFirstProject}
            aria-label="前の実績を見る"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute right-0 md:right-[-8px] top-[calc(100%+8px)] md:top-1/2 z-10 md:translate-y-1/2 md:-translate-x-[-100%]">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full bg-background/80 backdrop-blur-md",
              isLastProject && "opacity-0 invisible cursor-not-allowed",
            )}
            onClick={navigateToNext}
            disabled={isLastProject}
            aria-label="次の実績を見る"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
