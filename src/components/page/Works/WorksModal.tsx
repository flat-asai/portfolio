"use client";

import type React from "react";
import type { Work } from "@/cms/types/generated/work";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentWork = works[currentIndex];
  const isFirstProject = currentIndex === 0;
  const isLastProject = currentIndex === works.length - 1;

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
  }, [isOpen, onClose, currentIndex, works.length, isFirstProject, isLastProject]);

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

  // 前のプロジェクトに移動
  const navigateToPrevious = () => {
    if (isAnimating || isFirstProject) return;

    setIsAnimating(true);
    setSlideDirection("right");

    const newIndex = currentIndex - 1;
    setTimeout(
      () => {
        onNavigate(newIndex);
        setIsAnimating(false);
      },
      animationsEnabled ? 300 : 0,
    );
  };

  // 次のプロジェクトに移動
  const navigateToNext = () => {
    if (isAnimating || isLastProject) return;

    setIsAnimating(true);
    setSlideDirection("left");

    const newIndex = currentIndex + 1;
    setTimeout(
      () => {
        onNavigate(newIndex);
        setIsAnimating(false);
      },
      animationsEnabled ? 300 : 0,
    );
  };

  // スライドアニメーションの設定
  const slideVariants = {
    enterFromRight: {
      x: "100%",
      opacity: 0,
    },
    enterFromLeft: {
      x: "-100%",
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exitToLeft: {
      x: "-100%",
      opacity: 0,
    },
    exitToRight: {
      x: "100%",
      opacity: 0,
    },
  };

  if (!isOpen || !currentWork) return null;

  // サムネイル画像のURLを取得
  const thumbnailUrl =
    currentWork.thumbnail && currentWork.thumbnail.length > 0
      ? currentWork.thumbnail[0].url
      : "/placeholder.svg";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <motion.div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-background shadow-lg"
        initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : {}}
        animate={animationsEnabled ? { opacity: 1, scale: 1 } : {}}
        exit={animationsEnabled ? { opacity: 0, scale: 0.95 } : {}}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={handleCloseClick}
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* ナビゲーションボタン */}
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm",
              isFirstProject && "opacity-50 cursor-not-allowed",
            )}
            onClick={navigateToPrevious}
            disabled={isFirstProject}
            aria-label="前の実績を見る"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm",
              isLastProject && "opacity-50 cursor-not-allowed",
            )}
            onClick={navigateToNext}
            disabled={isLastProject}
            aria-label="次の実績を見る"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentWork.slug}
            initial={
              animationsEnabled
                ? slideDirection === "left"
                  ? slideVariants.enterFromRight
                  : slideVariants.enterFromLeft
                : {}
            }
            animate={animationsEnabled ? slideVariants.center : {}}
            exit={
              animationsEnabled
                ? slideDirection === "left"
                  ? slideVariants.exitToLeft
                  : slideVariants.exitToRight
                : {}
            }
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="relative h-64 sm:h-80 md:h-96">
              <Image
                src={thumbnailUrl}
                alt={`${currentWork.title}のメイン画像`}
                className="h-full w-full object-cover"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h2 id="project-modal-title" className="text-2xl font-bold text-foreground mb-2">
                  {currentWork.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {currentWork.technologies?.map((tech, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">プロジェクト概要</h3>
                <p className="text-muted-foreground">{currentWork.description}</p>
              </div>

              {currentWork.body && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">詳細</h3>
                  <div
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: currentWork.body }}
                  />
                </div>
              )}

              {currentWork.roles && currentWork.roles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">担当した作業範囲</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentWork.roles.map((role, index) => (
                      <Badge key={index} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentWork.duration && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">制作期間</h3>
                  <p className="text-muted-foreground">{currentWork.duration}</p>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {works.length}
                </div>
                {currentWork.url && (
                  <Button asChild>
                    <a href={currentWork.url} target="_blank" rel="noopener noreferrer">
                      サイトを見る
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
