"use client";
import { useAccessibility } from "@/components/ui/";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import ImageHero01 from "@/assets/images/hero/hero01.jpg";
import ImageHero02 from "@/assets/images/hero/hero02.jpg";
import ImageHero03 from "@/assets/images/hero/hero03.jpg";
import ImageHero04 from "@/assets/images/hero/hero04.jpg";
import ImageHero05 from "@/assets/images/hero/hero05.jpg";
import ImageHero06 from "@/assets/images/hero/hero06.jpg";

export function Hero() {
  const { animationsEnabled } = useAccessibility();
  const MotionDiv = animationsEnabled ? motion.div : "div";

  // スライダー用の画像データ
  const sliderImages = [
    {
      id: 1,
      src: ImageHero01.src,
    },
    {
      id: 2,
      src: ImageHero06.src,
    },
    {
      id: 3,
      src: ImageHero04.src,
    },
    {
      id: 4,
      src: ImageHero03.src,
    },
    {
      id: 5,
      src: ImageHero05.src,
    },
    {
      id: 6,
      src: ImageHero02.src,
    },
  ];

  // 左右の列に分割
  const leftColumnImages = sliderImages.slice(0, 3);
  const rightColumnImages = sliderImages.slice(3);

  // 無限スクロールのために画像を複製
  const duplicatedLeftImages = [...leftColumnImages, ...leftColumnImages];
  const duplicatedRightImages = [...rightColumnImages, ...rightColumnImages];

  return (
    <section className="relative w-full min-h-[calc(100vh-60px)] flex items-center bg-gradient-to-br from-background to-muted/50 overflow-hidden">
      <div className="w-full md:max-w-[1440px] mx-auto relative z-10 px-4 md:px-6 py-12 md:py-24">
        <div className="grid md:items-center">
          <MotionDiv
            className="flex flex-col space-y-6 z-10 max-md:bg-background max-md:pr-4 max-md:pl-2 max-md:pt-4 max-md:pb-8 max-md:rounded-lg max-md:max-w-[340px]"
            initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
            animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                アクセシビリティと
                <br className="md:hidden" />
                UI設計で、
              </span>
              <span className="block md:mt-2">伝わるWebを。</span>
            </h1>

            <p className="text-sm md:text-xl text-muted-foreground max-w-[600px]">
              見た目の美しさと、誰にとっても使いやすい構造を両立。
              <br />
              多様なユーザーに寄り添ったWebサイトを心がけています。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#works" prefetch={false}>
                <Button size="lg" className="text-lg px-8">
                  実績を見る
                </Button>
              </Link>
            </div>
          </MotionDiv>

          {/* スライダー - 左側の要素と少しかぶるように配置 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[70%] md:w-[60%] h-[calc(100vh-60px)] overflow-hidden">
            {/* スライダーコンテナ */}
            <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
              {/* 左側のスライダー（上方向に移動） */}
              <div className="relative overflow-hidden">
                <MotionDiv
                  className="flex flex-col gap-2"
                  initial={{ y: 0 }}
                  animate={animationsEnabled ? { y: [0, "-50%"] } : {}}
                  transition={{
                    y: {
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      ease: "linear",
                    },
                  }}
                >
                  {duplicatedLeftImages.map((image, index) => (
                    <div
                      key={`left-${image.id}-${index}`}
                      className="relative aspect-[810/504] rounded-lg overflow-hidden shadow-lg"
                    >
                      <Image
                        src={image.src}
                        alt=""
                        className="w-full h-full object-cover"
                        width={810}
                        height={504}
                      />
                    </div>
                  ))}
                </MotionDiv>
              </div>

              {/* 右側のスライダー（下方向に移動） */}
              <div className="relative overflow-hidden max-md:hidden">
                <MotionDiv
                  className="flex flex-col gap-2"
                  initial={{ y: "-50%" }}
                  animate={animationsEnabled ? { y: ["-50%", "0%"] } : {}}
                  transition={{
                    y: {
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      ease: "linear",
                    },
                  }}
                >
                  {duplicatedRightImages.map((image, index) => (
                    <div
                      key={`right-${image.id}-${index}`}
                      className="relative aspect-[810/504] rounded-lg overflow-hidden shadow-lg"
                    >
                      <Image
                        src={image.src}
                        alt=""
                        className="w-full h-full object-cover"
                        width={810}
                        height={504}
                      />
                    </div>
                  ))}
                </MotionDiv>
              </div>
            </div>

            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
