"use client";

import { useAccessibility } from "@/components/ui/AccessibilityProvider";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const Hero = () => {
  const { animationsEnabled } = useAccessibility();

  const MotionDiv = animationsEnabled ? motion.div : "div";

  return (
    <section className="relative w-full min-h-[80vh] flex items-center bg-gradient-to-br from-background to-muted/50">
      <div className="container relative z-10 px-4 md:px-6 py-12 md:py-24">
        <div>
          <MotionDiv
            className="flex flex-col space-y-6"
            initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
            animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block">アクセシビリティとUI設計で、</span>
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                伝わるWebを。
              </span>
            </h1>

            <div className="text-xl text-muted-foreground max-w-[600px]">
              <p>
                見た目の美しさと、誰にとっても使いやすい構造を両立。
                <br />
                多様なユーザーに寄り添ったWebサイトを心がけています。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="#works">
                <Button size="lg" className="text-lg px-8">
                  実績を見る
                </Button>
              </Link>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};
